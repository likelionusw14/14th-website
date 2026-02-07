import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../../shared/context/AuthContext';
import StarBackground from '../../shared/ui/StarBackground';

interface ResultData {
    status: 'DOCUMENT_APPROVED' | 'INTERVIEW_APPROVED' | 'REJECTED' | 'PENDING';
    track: 'FRONTEND' | 'BACKEND' | 'DESIGN' | 'PM';
    interviewPreferences: {
        times: Array<{ priority: number; date: string; time: string }>;
    } | null;
    confirmedInterviewDate: string | null;
    confirmedInterviewTime: string | null;
}

const ResultPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [result, setResult] = useState<ResultData | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultOpenDate, setResultOpenDate] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{ studentId: string; name: string; phoneLastDigits: string } | null>(null);

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
                    studentId: data.studentId,
                    name: data.name,
                    phoneLastDigits: data.phoneLastDigits
                })
            });

            const resultData = await response.json();

            if (resultData.success) {
                setResult(resultData.result);
                // 사용자 정보 저장 (면접 일정 선택 시 사용)
                setUserInfo({
                    studentId: data.studentId,
                    name: data.name,
                    phoneLastDigits: data.phoneLastDigits
                });
            } else {
                if (resultData.resultOpenDate) {
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
                    <p className="text-slate-400 mb-8">학번, 이름, 전화번호 뒷자리를 입력하여 결과를 확인하세요</p>

                    {resultOpenDate && (
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 mb-6">
                            결과 공개일: {new Date(resultOpenDate).toLocaleDateString('ko-KR')}
                        </div>
                    )}

                    {!result ? (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">학번</label>
                                <input
                                    {...register('studentId', { required: '학번을 입력해주세요' })}
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                                    placeholder="예: 2024123456"
                                />
                                {errors.studentId && <span className="text-red-400 text-xs mt-1">{errors.studentId.message as string}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">이름</label>
                                <input
                                    {...register('name', { required: '이름을 입력해주세요' })}
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                                    placeholder="홍길동"
                                />
                                {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name.message as string}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">전화번호 뒷자리 (4자리)</label>
                                <input
                                    {...register('phoneLastDigits', { 
                                        required: '전화번호 뒷자리를 입력해주세요',
                                        pattern: {
                                            value: /^\d{4}$/,
                                            message: '4자리 숫자를 입력해주세요'
                                        }
                                    })}
                                    type="text"
                                    maxLength={4}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                                    placeholder="1234"
                                />
                                {errors.phoneLastDigits && <span className="text-red-400 text-xs mt-1">{errors.phoneLastDigits.message as string}</span>}
                            </div>

                            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-comet-blue to-nebula-purple rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
                            >
                                {isLoading ? '조회 중...' : '결과 조회'}
                            </button>
                        </motion.form>
                    ) : (
                        <div className="space-y-6">
                            <div className={`p-6 rounded-lg ${getStatusColor(result.status)}`}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold mb-2">{getStatusText(result.status)}</div>
                                    <div className="text-sm mt-2">트랙: {getTrackText(result.track)}</div>
                                </div>
                            </div>

                            {result.status === 'DOCUMENT_APPROVED' && (
                                <>
                                    {result.confirmedInterviewDate && result.confirmedInterviewTime ? (
                                        <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <h3 className="text-white font-semibold mb-4">확정된 면접 일정</h3>
                                            <div className="text-lg text-green-300">
                                                {new Date(result.confirmedInterviewDate).toLocaleDateString('ko-KR', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric',
                                                    weekday: 'long'
                                                })} {result.confirmedInterviewTime}
                                            </div>
                                        </div>
                                    ) : result.interviewPreferences ? (
                                        <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
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
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <h3 className="text-white font-semibold mb-2">면접 일정 선택</h3>
                                            <p className="text-slate-300 mb-4">면접 일정을 선택해주세요.</p>
                                            <a
                                                href={userInfo ? `/interview-schedule?studentId=${encodeURIComponent(userInfo.studentId)}&name=${encodeURIComponent(userInfo.name)}&phoneLastDigits=${encodeURIComponent(userInfo.phoneLastDigits)}` : '/interview-schedule'}
                                                className="inline-block px-6 py-3 bg-comet-blue text-white rounded-lg font-semibold hover:bg-comet-blue/80 transition-all"
                                            >
                                                면접 일정 선택하기
                                            </a>
                                        </div>
                                    )}
                                </>
                            )}
                            {result.status === 'INTERVIEW_APPROVED' && (
                                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
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
                                </div>
                            )}

                            {result.status === 'REJECTED' && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                                    아쉽게도 이번 기수에는 합격하지 못하셨습니다. 다음 기회를 기대하겠습니다.
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ResultPage;
