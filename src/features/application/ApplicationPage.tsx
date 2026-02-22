import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';
import { API_BASE_URL } from '../../shared/context/AuthContext';
import { Card, CardContent } from '@/shared/ui/shadcn/card';

interface ScheduleData {
    applicationStartDate: string | null;
    applicationEndDate: string | null;
    documentResultStartDate: string | null;
    documentResultEndDate: string | null;
    interviewScheduleDate: string | null;
    finalResultDate: string | null;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const ApplicationPage = () => {
    const [googleFormUrl, setGoogleFormUrl] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<ScheduleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [countdownLabel, setCountdownLabel] = useState('');

    useEffect(() => {
        Promise.all([fetchGoogleFormUrl(), fetchSchedule()]).finally(() => setIsLoading(false));
    }, []);

    // 카운트다운 타이머
    useEffect(() => {
        if (!schedule) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const start = schedule.applicationStartDate ? new Date(schedule.applicationStartDate).getTime() : null;
            const end = schedule.applicationEndDate ? new Date(schedule.applicationEndDate).getTime() : null;

            let targetTime: number | null = null;
            let label = '';

            if (start && now < start) {
                targetTime = start;
                label = '모집 시작까지';
            } else if (end && now < end) {
                targetTime = end;
                label = '지원 마감까지';
            }

            if (targetTime) {
                const diff = targetTime - now;
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                });
                setCountdownLabel(label);
            } else {
                setTimeLeft(null);
                setCountdownLabel('');
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [schedule]);

    const fetchGoogleFormUrl = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/google-form-url`);
            const result = await response.json();
            if (result.success) {
                setGoogleFormUrl(result.googleFormUrl);
            }
        } catch (error) {
            console.error('Failed to fetch google form URL:', error);
        }
    };

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

    const getApplicationStatus = (): 'before' | 'open' | 'closed' => {
        if (!schedule) return 'open'; // 일정 불러오기 전, 기본값
        const now = new Date().getTime();
        const start = schedule.applicationStartDate ? new Date(schedule.applicationStartDate).getTime() : null;
        const end = schedule.applicationEndDate ? new Date(schedule.applicationEndDate).getTime() : null;

        if (start && now < start) return 'before';
        if (end && now > end) return 'closed';
        return 'open';
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

    const getStepStatus = (dateStr: string | null): 'upcoming' | 'active' | 'past' => {
        if (!dateStr) return 'upcoming';
        const now = new Date().getTime();
        const date = new Date(dateStr).getTime();
        // 현재 시점보다 과거면 past
        if (now >= date) return 'past';
        return 'upcoming';
    };

    const appStatus = getApplicationStatus();

    const scheduleSteps = schedule ? [
        {
            label: '지원 접수',
            date: schedule.applicationStartDate,
            endDate: schedule.applicationEndDate,
            icon: '📝'
        },
        {
            label: '서류 결과 발표',
            date: schedule.documentResultStartDate,
            icon: '📋'
        },
        {
            label: '면접 일정 공개',
            date: schedule.interviewScheduleDate,
            icon: '🗓️'
        },
        {
            label: '최종 결과 발표',
            date: schedule.finalResultDate,
            icon: '🎉'
        }
    ] : [];

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
                    <h1 className="text-3xl font-bold text-white mb-2">지원서 제출</h1>
                    <p className="text-slate-400 mb-8">멋쟁이사자처럼 14기에 지원해주세요!</p>

                    <div className="space-y-6">
                        {/* 카운트다운 타이머 */}
                        {timeLeft && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-comet-blue/20 to-nebula-purple/20 border border-white/10"
                            >
                                <div className="text-center mb-4">
                                    <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">
                                        {countdownLabel}
                                    </span>
                                </div>
                                <div className="flex justify-center items-center gap-3 md:gap-5">
                                    {[
                                        { value: timeLeft.days, label: '일' },
                                        { value: timeLeft.hours, label: '시간' },
                                        { value: timeLeft.minutes, label: '분' },
                                        { value: timeLeft.seconds, label: '초' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                                <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                                                    {String(item.value).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400 mt-2">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* 모집 일정 타임라인 */}
                        {scheduleSteps.length > 0 && (
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="pt-6">
                                    <h3 className="text-white font-semibold mb-5">📅 모집 일정</h3>
                                    <div className="relative">
                                        {/* 세로 연결선 */}
                                        <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-white/10" />

                                        <div className="space-y-5">
                                            {scheduleSteps.map((step, idx) => {
                                                const status = getStepStatus(step.date);
                                                const isPast = status === 'past';
                                                const isCurrent = idx === 0
                                                    ? appStatus === 'open'
                                                    : (isPast && idx < scheduleSteps.length - 1 && getStepStatus(scheduleSteps[idx + 1].date) === 'upcoming');

                                                return (
                                                    <div key={idx} className="flex items-start gap-4 relative">
                                                        {/* 타임라인 점 */}
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 z-10 ${isCurrent
                                                            ? 'bg-comet-blue ring-2 ring-comet-blue/40 ring-offset-2 ring-offset-transparent'
                                                            : isPast
                                                                ? 'bg-green-500/20 border border-green-500/40'
                                                                : 'bg-white/5 border border-white/20'
                                                            }`}>
                                                            {step.icon}
                                                        </div>
                                                        <div className="flex-1 pb-1">
                                                            <div className={`font-semibold text-sm ${isCurrent ? 'text-comet-blue' : isPast ? 'text-green-400' : 'text-slate-300'
                                                                }`}>
                                                                {step.label}
                                                                {isCurrent && (
                                                                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-comet-blue/20 text-comet-blue animate-pulse">
                                                                        진행 중
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {formatDate(step.date)}
                                                                {'endDate' in step && step.endDate && (
                                                                    <span> ~ {formatDate(step.endDate)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 지원하기 섹션 */}
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="pt-6">
                                <h3 className="text-white font-semibold mb-4">지원 방법</h3>

                                {appStatus === 'before' ? (
                                    <div className="w-full py-4 bg-blue-500/20 rounded-lg text-blue-300 text-center font-semibold">
                                        🕐 곧 모집이 시작됩니다!
                                    </div>
                                ) : appStatus === 'closed' ? (
                                    <div className="w-full py-4 bg-gray-500/20 rounded-lg text-gray-400 text-center">
                                        모집이 마감되었습니다.
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-slate-300 mb-6">
                                            아래 버튼을 클릭하여 구글폼으로 이동하여 지원서를 제출해주세요.
                                            <br />
                                            지원서 제출 후 관리자가 검토하여 합/불 결과를 공개합니다.
                                        </p>

                                        {isLoading ? (
                                            <div className="w-full py-4 bg-gray-500/20 rounded-lg text-gray-400 text-center">
                                                로딩 중...
                                            </div>
                                        ) : googleFormUrl ? (
                                            <a
                                                href={googleFormUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block w-full py-4 bg-gradient-to-r from-comet-blue to-nebula-purple rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all text-center"
                                            >
                                                구글폼으로 지원하기 →
                                            </a>
                                        ) : (
                                            <div className="w-full py-4 bg-yellow-500/20 rounded-lg text-yellow-300 text-center">
                                                구글폼 링크가 설정되지 않았습니다. 관리자에게 문의하세요.
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-500/10 border-blue-500/20">
                            <CardContent className="pt-6">
                                <h3 className="text-white font-semibold mb-2">지원 결과 확인</h3>
                                <p className="text-slate-300 mb-4">
                                    지원 결과는 공개일 이후에 확인할 수 있습니다.
                                </p>
                                <a
                                    href="/result"
                                    className="inline-block px-6 py-3 bg-comet-blue text-white rounded-lg font-semibold hover:bg-comet-blue/80 transition-all"
                                >
                                    결과 조회하기
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ApplicationPage;
