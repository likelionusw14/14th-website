import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../../shared/context/AuthContext';
import StarBackground from '../../shared/ui/StarBackground';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';
import { Card, CardContent } from '@/shared/ui/shadcn/card';

interface ResultData {
    status: 'DOCUMENT_APPROVED' | 'INTERVIEW_APPROVED' | 'REJECTED' | 'PENDING';
    track: 'FRONTEND' | 'BACKEND' | 'DESIGN' | 'PM';
    interviewPreferences: {
        times: Array<{ priority: number; date: string; time: string }>;
    } | null;
    confirmedInterviewDate: string | null;
    confirmedInterviewTime: string | null;
}

interface ScheduleData {
    applicationStartDate: string | null;
    applicationEndDate: string | null;
    documentResultStartDate: string | null;
    documentResultEndDate: string | null;
    interviewScheduleDate: string | null;
    finalResultDate: string | null;
}

const ResultPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [result, setResult] = useState<ResultData | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultOpenDate, setResultOpenDate] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{ name: string; phoneLastDigits: string } | null>(null);
    const [schedule, setSchedule] = useState<ScheduleData | null>(null);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/schedule`);
            const result = await response.json();
            if (result.success) {
                setSchedule(result.schedule);
            }
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        }
    };

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        setResult(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/application/result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name,
                    phoneLastDigits: data.phoneLastDigits
                })
            });

            const resultData = await response.json();

            if (resultData.success) {
                setResult(resultData.result);
                // 사용자 정보 저장 (면접 일정 선택 시 사용)
                setUserInfo({
                    name: data.name,
                    phoneLastDigits: data.phoneLastDigits
                });
            } else {
                if (resultData.documentResultStartDate) {
                    setResultOpenDate(resultData.documentResultStartDate);
                } else if (resultData.resultOpenDate) {
                    setResultOpenDate(resultData.resultOpenDate);
                }
                setErrorMsg(resultData.message || '결과를 찾을 수 없습니다');
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '미정';
        return new Date(dateStr).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStepStatus = (dateStr: string | null): 'upcoming' | 'past' => {
        if (!dateStr) return 'upcoming';
        const now = new Date().getTime();
        const date = new Date(dateStr).getTime();
        if (now >= date) return 'past';
        return 'upcoming';
    };

    const scheduleSteps = schedule ? [
        { label: '지원 접수', date: schedule.applicationStartDate, endDate: schedule.applicationEndDate, icon: '📝' },
        { label: '서류 결과 발표', date: schedule.documentResultStartDate, icon: '📋' },
        { label: '면접 일정 공개', date: schedule.interviewScheduleDate, icon: '🗓️' },
        { label: '최종 결과 발표', date: schedule.finalResultDate, icon: '🎉' }
    ] : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DOCUMENT_APPROVED':
                return 'text-blue-400 bg-blue-500/20';
            case 'INTERVIEW_APPROVED':
                return 'text-green-400 bg-green-500/20';
            case 'REJECTED':
                return 'text-red-400 bg-red-500/20';
            default:
                return 'text-yellow-400 bg-yellow-500/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DOCUMENT_APPROVED':
                return '서류합격';
            case 'INTERVIEW_APPROVED':
                return '최종합격';
            case 'REJECTED':
                return '불합격';
            default:
                return '대기 중';
        }
    };

    const getTrackText = (track: string) => {
        switch (track) {
            case 'FRONTEND':
                return '프론트엔드';
            case 'BACKEND':
                return '백엔드';
            case 'DESIGN':
                return '디자인';
            case 'PM':
                return '기획';
            default:
                return track;
        }
    };

    return (
        <div className="min-h-screen p-4 relative overflow-hidden bg-deep-navy">
            <StarBackground />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-3xl border border-white/10 shadow-2xl"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">지원 결과 조회</h1>
                    <p className="text-slate-400 mb-8">이름, 전화번호 뒷자리를 입력하여 결과를 확인하세요</p>

                    {/* 모집 일정 타임라인 */}
                    {scheduleSteps.length > 0 && (
                        <div className="p-5 rounded-lg bg-white/5 border border-white/10 mb-6">
                            <h3 className="text-white font-semibold mb-4 text-sm">📅 모집 일정</h3>
                            <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-0 md:justify-between relative">
                                {/* 가로 연결선 (md 이상) */}
                                <div className="hidden md:block absolute top-4 left-8 right-8 h-0.5 bg-white/10" />

                                {scheduleSteps.map((step, idx) => {
                                    const isPast = getStepStatus(step.date) === 'past';
                                    const isCurrent = isPast && idx < scheduleSteps.length - 1 && getStepStatus(scheduleSteps[idx + 1].date) === 'upcoming';

                                    return (
                                        <div key={idx} className="flex md:flex-col items-center gap-3 md:gap-1 flex-1 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isCurrent
                                                ? 'bg-comet-blue ring-2 ring-comet-blue/40'
                                                : isPast
                                                    ? 'bg-green-500/20 border border-green-500/40'
                                                    : 'bg-white/5 border border-white/20'
                                                }`}>
                                                {step.icon}
                                            </div>
                                            <div className="md:text-center">
                                                <div className={`text-xs font-semibold ${isCurrent ? 'text-comet-blue' : isPast ? 'text-green-400' : 'text-slate-400'
                                                    }`}>
                                                    {step.label}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {formatDate(step.date)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {resultOpenDate && (
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 mb-6">
                            결과 공개 예정일: {new Date(resultOpenDate).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    )}

                    {!result ? (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >


                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    {...register('name', { required: '이름을 입력해주세요' })}
                                    placeholder="홍길동"
                                />
                                {errors.name && <span className="text-red-400 text-xs">{errors.name.message as string}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneLastDigits">전화번호 뒷자리 (4자리)</Label>
                                <Input
                                    id="phoneLastDigits"
                                    {...register('phoneLastDigits', {
                                        required: '전화번호 뒷자리를 입력해주세요',
                                        pattern: {
                                            value: /^\d{4}$/,
                                            message: '4자리 숫자를 입력해주세요'
                                        }
                                    })}
                                    maxLength={4}
                                    placeholder="1234"
                                />
                                {errors.phoneLastDigits && <span className="text-red-400 text-xs">{errors.phoneLastDigits.message as string}</span>}
                            </div>

                            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-comet-blue to-nebula-purple hover:from-comet-blue/90 hover:to-nebula-purple/90"
                                size="lg"
                            >
                                {isLoading ? '조회 중...' : '결과 조회'}
                            </Button>
                        </motion.form>
                    ) : (
                        <div className="space-y-6">
                            <Card className={`border-none ${getStatusColor(result.status)}`}>
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-bold mb-2">{getStatusText(result.status)}</div>
                                    <div className="text-sm mt-2">트랙: {getTrackText(result.track)}</div>
                                </CardContent>
                            </Card>

                            {result.status === 'DOCUMENT_APPROVED' && (
                                <>
                                    {result.confirmedInterviewDate && result.confirmedInterviewTime ? (
                                        <Card className="bg-green-500/10 border-green-500/20">
                                            <CardContent className="pt-6">
                                                <h3 className="text-white font-semibold mb-4">확정된 면접 일정</h3>
                                                <div className="text-lg text-green-300">
                                                    {new Date(result.confirmedInterviewDate).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        weekday: 'long'
                                                    })} {result.confirmedInterviewTime}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : result.interviewPreferences ? (
                                        <Card className="bg-blue-500/10 border-blue-500/20">
                                            <CardContent className="pt-6">
                                                <h3 className="text-white font-semibold mb-4">제출한 면접 일정 선호도</h3>
                                                <div className="space-y-2">
                                                    <div className="text-slate-300">
                                                        면접 일정 후보:
                                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                                            {result.interviewPreferences.times
                                                                .sort((a, b) => a.priority - b.priority)
                                                                .map((t, idx) => (
                                                                    <li key={idx}>
                                                                        {t.priority}순위: {new Date(t.date).toLocaleDateString('ko-KR', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric'
                                                                        })} {t.time}
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                    <div className="text-sm text-slate-400 mt-4">
                                                        관리자가 일정을 확정하면 여기에 표시됩니다.
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Card className="bg-yellow-500/10 border-yellow-500/20">
                                            <CardContent className="pt-6">
                                                <h3 className="text-white font-semibold mb-2">면접 일정 선택</h3>
                                                <p className="text-slate-300 mb-4">면접 일정을 선택해주세요.</p>
                                                <a
                                                    href={userInfo ? `/interview-schedule?name=${encodeURIComponent(userInfo.name)}&phoneLastDigits=${encodeURIComponent(userInfo.phoneLastDigits)}` : '/interview-schedule'}
                                                    className="inline-block px-6 py-3 bg-comet-blue text-white rounded-lg font-semibold hover:bg-comet-blue/80 transition-all"
                                                >
                                                    면접 일정 선택하기
                                                </a>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                            {result.status === 'INTERVIEW_APPROVED' && (
                                <Card className="bg-green-500/10 border-green-500/20">
                                    <CardContent className="pt-6">
                                        <h3 className="text-white font-semibold mb-4">🎉 최종합격을 축하합니다!</h3>
                                        <p className="text-slate-300 mb-4">
                                            멋쟁이사자처럼 14기에 최종합격하셨습니다. 이제 로그인하여 동아리 활동을 시작할 수 있습니다.
                                        </p>
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-slate-400">
                                                • 계정이 이미 있으시면 로그인해주세요
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                • 계정이 없으시면 학번으로 자동 생성된 계정으로 로그인하실 수 있습니다 (초기 비밀번호: 학번)
                                            </p>
                                        </div>
                                        <a
                                            href="/login"
                                            className="inline-block px-6 py-3 bg-comet-blue text-white rounded-lg font-semibold hover:bg-comet-blue/80 transition-all"
                                        >
                                            로그인하기
                                        </a>
                                    </CardContent>
                                </Card>
                            )}

                            {result.status === 'REJECTED' && (
                                <Card className="bg-red-500/10 border-red-500/20">
                                    <CardContent className="pt-6 text-red-300">
                                        아쉽게도 이번 기수에는 합격하지 못하셨습니다. 다음 기회를 기대하겠습니다.
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ResultPage;
