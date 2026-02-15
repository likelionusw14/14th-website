import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../shared/context/AuthContext';
import StarBackground from '../../shared/ui/StarBackground';

interface InterviewSettings {
    availableDates: string[];
    startTime: string;
    endTime: string;
    intervalMinutes: number;
}

const InterviewSchedulePage = () => {
    const [searchParams] = useSearchParams();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dateOptions, setDateOptions] = useState<{ value: string; label: string }[]>([]);
    const [timeOptions, setTimeOptions] = useState<string[]>([]);

    // URL 파라미터에서 사용자 정보 가져오기
    useEffect(() => {
        const studentId = searchParams.get('studentId');
        const name = searchParams.get('name');
        const phoneLastDigits = searchParams.get('phoneLastDigits');

        if (studentId) setValue('studentId', studentId);
        if (name) setValue('name', name);
        if (phoneLastDigits) setValue('phoneLastDigits', phoneLastDigits);
    }, [searchParams, setValue]);

    // 면접 설정 동적으로 가져오기
    useEffect(() => {
        const fetchInterviewSettings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/application/interview-settings`);
                const result = await response.json();

                if (result.success && result.settings) {
                    const settings: InterviewSettings = result.settings;

                    // 날짜 옵션 생성
                    const dates = settings.availableDates.map((dateStr: string) => {
                        const date = new Date(dateStr);
                        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                        const month = date.getMonth() + 1;
                        const day = date.getDate();
                        const dayName = dayNames[date.getDay()];
                        return {
                            value: dateStr,
                            label: `${month}월 ${day}일 (${dayName})`
                        };
                    });
                    setDateOptions(dates);

                    // 시간 옵션 생성
                    const times: string[] = [];
                    const [startHour, startMin] = settings.startTime.split(':').map(Number);
                    const [endHour, endMin] = settings.endTime.split(':').map(Number);
                    const interval = settings.intervalMinutes;

                    let currentMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;

                    while (currentMinutes <= endMinutes) {
                        const h = Math.floor(currentMinutes / 60);
                        const m = currentMinutes % 60;
                        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                        currentMinutes += interval;
                    }
                    setTimeOptions(times);
                }
            } catch (error) {
                console.error('Failed to fetch interview settings:', error);
                // 기본값 사용
                setDateOptions([
                    { value: '2026-02-23', label: '2월 23일 (월)' },
                    { value: '2026-02-24', label: '2월 24일 (화)' },
                    { value: '2026-02-25', label: '2월 25일 (수)' }
                ]);
                const defaultTimes: string[] = [];
                for (let hour = 9; hour <= 15; hour++) {
                    defaultTimes.push(`${hour.toString().padStart(2, '0')}:00`);
                    defaultTimes.push(`${hour.toString().padStart(2, '0')}:20`);
                    defaultTimes.push(`${hour.toString().padStart(2, '0')}:40`);
                }
                defaultTimes.push('16:00');
                setTimeOptions(defaultTimes);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviewSettings();
    }, []);

    // URL 파라미터에서 사용자 정보가 있으면 본인 확인 섹션 숨기기
    const hasUserInfo = searchParams.get('studentId') && searchParams.get('name') && searchParams.get('phoneLastDigits');

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        setSuccessMsg('');
        setIsSubmitting(true);

        try {
            // URL 파라미터에서 사용자 정보 가져오기 (없으면 폼에서 가져오기)
            const studentId = searchParams.get('studentId') || data.studentId;
            const name = searchParams.get('name') || data.name;
            const phoneLastDigits = searchParams.get('phoneLastDigits') || data.phoneLastDigits;

            // 필수 필드 검증
            if (!studentId || !name || !phoneLastDigits) {
                setErrorMsg('모든 필수 정보를 입력해주세요');
                setIsSubmitting(false);
                return;
            }

            // times 배열을 올바른 형식으로 변환 (각 순위마다 날짜와 시간)
            const timesArray = [
                { priority: 1, date: data.date1, time: data.time1 },
                { priority: 2, date: data.date2, time: data.time2 },
                { priority: 3, date: data.date3, time: data.time3 }
            ];

            // 날짜와 시간이 모두 선택되었는지 확인
            for (let i = 0; i < timesArray.length; i++) {
                if (!timesArray[i].date || !timesArray[i].time) {
                    setErrorMsg(`${i + 1}순위의 날짜와 시간을 모두 선택해주세요`);
                    setIsSubmitting(false);
                    return;
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/application/interview-preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId,
                    name,
                    phoneLastDigits,
                    times: timesArray
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMsg('면접 일정이 제출되었습니다. 관리자가 확정하면 결과 조회 페이지에서 확인할 수 있습니다.');
            } else {
                setErrorMsg(result.message || '제출에 실패했습니다');
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다');
        } finally {
            setIsSubmitting(false);
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
                    <h1 className="text-3xl font-bold text-white mb-2">면접 일정 선택</h1>
                    <p className="text-slate-400 mb-8">합격하신 분은 면접 일정을 선택해주세요. 3개의 시간 후보를 우선순위로 선택해주세요.</p>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="text-slate-400">면접 일정을 불러오는 중...</div>
                        </div>
                    ) : (

                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* 인증 정보 (URL 파라미터가 없을 때만 표시) */}
                            {!hasUserInfo && (
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <h3 className="text-white font-semibold mb-4">본인 확인</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">학번</label>
                                            <input
                                                {...register('studentId', { required: '학번을 입력해주세요' })}
                                                type="text"
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                                placeholder="2024123456"
                                            />
                                            {errors.studentId && <span className="text-red-400 text-xs mt-1">{errors.studentId.message as string}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">이름</label>
                                            <input
                                                {...register('name', { required: '이름을 입력해주세요' })}
                                                type="text"
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                                placeholder="홍길동"
                                            />
                                            {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name.message as string}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">전화번호 뒷자리</label>
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
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                                placeholder="1234"
                                            />
                                            {errors.phoneLastDigits && <span className="text-red-400 text-xs mt-1">{errors.phoneLastDigits.message as string}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 면접 일정 선택 (각 순위마다 날짜와 시간 선택) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-4">면접 일정 선택 (3개의 후보를 우선순위로 선택)</label>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((priority) => (
                                        <div key={priority} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                                {priority}순위 일정 선택
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-2">날짜</label>
                                                    <select
                                                        {...register(`date${priority}` as any, {
                                                            required: `${priority}순위 날짜를 선택해주세요`
                                                        })}
                                                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-comet-blue"
                                                    >
                                                        <option value="">날짜 선택</option>
                                                        {dateOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors[`date${priority}` as any] && (
                                                        <span className="text-red-400 text-xs mt-1">
                                                            {errors[`date${priority}` as any]?.message as string}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-2">시간</label>
                                                    <select
                                                        {...register(`time${priority}` as any, {
                                                            required: `${priority}순위 시간을 선택해주세요`,
                                                            validate: (value, formValues) => {
                                                                const currentDate = formValues[`date${priority}` as any];
                                                                const currentTime = value;
                                                                // 다른 순위와 중복 확인
                                                                for (let i = 1; i <= 3; i++) {
                                                                    if (i !== priority) {
                                                                        const otherDate = formValues[`date${i}` as any];
                                                                        const otherTime = formValues[`time${i}` as any];
                                                                        if (otherDate === currentDate && otherTime === currentTime) {
                                                                            return '중복된 일정을 선택할 수 없습니다';
                                                                        }
                                                                    }
                                                                }
                                                                return true;
                                                            }
                                                        })}
                                                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-comet-blue"
                                                    >
                                                        <option value="">시간 선택</option>
                                                        {timeOptions.map((time) => (
                                                            <option key={time} value={time}>
                                                                {time}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors[`time${priority}` as any] && (
                                                        <span className="text-red-400 text-xs mt-1">
                                                            {errors[`time${priority}` as any]?.message as string}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}
                            {successMsg && <div className="p-3 rounded bg-green-500/20 text-green-300 text-xs">{successMsg}</div>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-comet-blue to-nebula-purple rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? '제출 중...' : '면접 일정 제출'}
                            </button>
                        </motion.form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default InterviewSchedulePage;
