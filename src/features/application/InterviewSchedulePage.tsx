import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface TimeSlot {
    date: string;
    time: string;
    dateLabel: string;
}

const PRIORITY_COLORS = [
    { bg: 'bg-blue-500', ring: 'ring-blue-500', text: 'text-blue-400', label: '1순위', emoji: '🥇' },
    { bg: 'bg-purple-500', ring: 'ring-purple-500', text: 'text-purple-400', label: '2순위', emoji: '🥈' },
    { bg: 'bg-amber-500', ring: 'ring-amber-500', text: 'text-amber-400', label: '3순위', emoji: '🥉' },
];

const InterviewSchedulePage = () => {
    const [searchParams] = useSearchParams();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dateOptions, setDateOptions] = useState<{ value: string; label: string; dayName: string; month: number; day: number }[]>([]);
    const [timeOptions, setTimeOptions] = useState<string[]>([]);

    // 선택 상태
    const [currentPriority, setCurrentPriority] = useState(0); // 0, 1, 2 (3개 순위)
    const [selections, setSelections] = useState<(TimeSlot | null)[]>([null, null, null]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

                    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                    const dates = settings.availableDates.map((dateStr: string) => {
                        const date = new Date(dateStr + 'T00:00:00');
                        return {
                            value: dateStr,
                            label: `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`,
                            dayName: dayNames[date.getDay()],
                            month: date.getMonth() + 1,
                            day: date.getDate(),
                        };
                    });
                    setDateOptions(dates);

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
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                setDateOptions([
                    '2026-02-23', '2026-02-24', '2026-02-25'
                ].map(dateStr => {
                    const date = new Date(dateStr + 'T00:00:00');
                    return {
                        value: dateStr,
                        label: `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`,
                        dayName: dayNames[date.getDay()],
                        month: date.getMonth() + 1,
                        day: date.getDate(),
                    };
                }));
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

    const hasUserInfo = searchParams.get('studentId') && searchParams.get('name') && searchParams.get('phoneLastDigits');

    // 날짜 선택
    const handleDateSelect = (dateValue: string) => {
        setSelectedDate(dateValue);
    };

    // 시간 선택 → 해당 순위 확정
    const handleTimeSelect = (time: string) => {
        if (!selectedDate) return;
        const dateOption = dateOptions.find(d => d.value === selectedDate);
        if (!dateOption) return;

        // 중복 체크
        const isDuplicate = selections.some(
            (s, idx) => s && idx !== currentPriority && s.date === selectedDate && s.time === time
        );
        if (isDuplicate) {
            setErrorMsg('이미 다른 순위에서 선택한 일정입니다');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        const newSelections = [...selections];
        newSelections[currentPriority] = {
            date: selectedDate,
            time,
            dateLabel: dateOption.label,
        };
        setSelections(newSelections);

        // 다음 미완료 순위로 자동 이동
        if (currentPriority < 2) {
            const nextEmpty = newSelections.findIndex((s, idx) => idx > currentPriority && s === null);
            if (nextEmpty !== -1) {
                setCurrentPriority(nextEmpty);
                setSelectedDate(null);
            }
        }
    };

    // 순위 클릭 → 해당 순위 수정 모드
    const handlePriorityClick = (idx: number) => {
        setCurrentPriority(idx);
        setSelectedDate(selections[idx]?.date || null);
    };

    // 순위 초기화
    const handleClearPriority = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelections = [...selections];
        newSelections[idx] = null;
        setSelections(newSelections);
        setCurrentPriority(idx);
        setSelectedDate(null);
    };

    // 해당 날짜+시간이 이미 선택되었는지 확인
    const isSlotTaken = (date: string, time: string) => {
        return selections.some(s => s && s.date === date && s.time === time);
    };

    const getSlotPriority = (date: string, time: string) => {
        return selections.findIndex(s => s && s.date === date && s.time === time);
    };

    const allSelected = selections.every(s => s !== null);

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        setSuccessMsg('');

        if (!allSelected) {
            setErrorMsg('3개의 면접 일정을 모두 선택해주세요');
            return;
        }

        setIsSubmitting(true);

        try {
            const studentId = searchParams.get('studentId') || data.studentId;
            const name = searchParams.get('name') || data.name;
            const phoneLastDigits = searchParams.get('phoneLastDigits') || data.phoneLastDigits;

            if (!studentId || !name || !phoneLastDigits) {
                setErrorMsg('모든 필수 정보를 입력해주세요');
                setIsSubmitting(false);
                return;
            }

            const timesArray = selections.map((s, idx) => ({
                priority: idx + 1,
                date: s!.date,
                time: s!.time,
            }));

            const response = await fetch(`${API_BASE_URL}/api/application/interview-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, name, phoneLastDigits, times: timesArray }),
            });

            const result = await response.json();
            if (result.success) {
                setSuccessMsg('면접 일정이 제출되었습니다! 관리자가 확정하면 결과 조회 페이지에서 확인할 수 있습니다.');
            } else {
                setErrorMsg(result.message || '제출에 실패했습니다');
            }
        } catch {
            setErrorMsg('서버 오류가 발생했습니다');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 시간을 오전/오후 포맷으로
    const formatTime = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        const period = h < 12 ? '오전' : '오후';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${period} ${displayHour}:${m.toString().padStart(2, '0')}`;
    };

    // 시간대를 그룹으로 나누기 (오전/오후)
    const morningTimes = timeOptions.filter(t => parseInt(t.split(':')[0]) < 12);
    const afternoonTimes = timeOptions.filter(t => parseInt(t.split(':')[0]) >= 12);

    return (
        <div className="min-h-screen p-4 relative overflow-hidden bg-deep-navy">
            <StarBackground />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">면접 일정 선택</h1>
                    <p className="text-slate-400 mb-10">합격하신 분은 면접 일정을 선택해주세요. 3개의 시간 후보를 우선순위로 선택해주세요.</p>

                    {isLoading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-8 h-8 border-2 border-comet-blue border-t-transparent rounded-full animate-spin mb-4" />
                            <div className="text-slate-400">면접 일정을 불러오는 중...</div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* 인증 정보 */}
                            {!hasUserInfo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass p-6 rounded-2xl border border-white/10 mb-8"
                                >
                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-comet-blue/20 text-comet-blue flex items-center justify-center text-xs font-bold">1</span>
                                        본인 확인
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">학번</label>
                                            <input
                                                {...register('studentId', { required: '학번을 입력해주세요' })}
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue transition-all"
                                                placeholder="2024123456"
                                            />
                                            {errors.studentId && <span className="text-red-400 text-xs mt-1">{errors.studentId.message as string}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">이름</label>
                                            <input
                                                {...register('name', { required: '이름을 입력해주세요' })}
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue transition-all"
                                                placeholder="홍길동"
                                            />
                                            {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name.message as string}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">전화번호 뒷자리</label>
                                            <input
                                                {...register('phoneLastDigits', {
                                                    required: '전화번호 뒷자리를 입력해주세요',
                                                    pattern: { value: /^\d{4}$/, message: '4자리 숫자를 입력해주세요' }
                                                })}
                                                type="text"
                                                maxLength={4}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue transition-all"
                                                placeholder="1234"
                                            />
                                            {errors.phoneLastDigits && <span className="text-red-400 text-xs mt-1">{errors.phoneLastDigits.message as string}</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 선택된 순위 요약 카드 */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[0, 1, 2].map((idx) => {
                                    const sel = selections[idx];
                                    const color = PRIORITY_COLORS[idx];
                                    const isActive = currentPriority === idx;

                                    return (
                                        <motion.button
                                            key={idx}
                                            type="button"
                                            onClick={() => handlePriorityClick(idx)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`relative p-4 rounded-2xl border-2 transition-all text-left ${isActive
                                                ? `border-white/40 bg-white/10 shadow-lg`
                                                : sel
                                                    ? `border-white/10 bg-white/5 hover:border-white/20`
                                                    : `border-dashed border-white/10 bg-white/[0.02] hover:border-white/20`
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white animate-pulse" />
                                            )}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">{color.emoji}</span>
                                                <span className={`text-sm font-bold ${color.text}`}>{color.label}</span>
                                            </div>
                                            {sel ? (
                                                <div>
                                                    <div className="text-white font-semibold text-sm">{sel.dateLabel}</div>
                                                    <div className={`${color.text} font-bold text-lg`}>{formatTime(sel.time)}</div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleClearPriority(idx, e)}
                                                        className="mt-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
                                                    >
                                                        ✕ 초기화
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-slate-500 text-sm">
                                                    {isActive ? '아래에서 선택해주세요 ↓' : '선택 대기'}
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* 선택 영역 */}
                            {!allSelected || currentPriority >= 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass p-6 md:p-8 rounded-2xl border border-white/10 mb-8"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-lg">{PRIORITY_COLORS[currentPriority].emoji}</span>
                                        <h3 className="text-white font-bold text-lg">
                                            {PRIORITY_COLORS[currentPriority].label} 일정 선택
                                        </h3>
                                    </div>

                                    {/* 날짜 선택 - 카드형 */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-slate-300 mb-3">📅 날짜 선택</label>
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                            {dateOptions.map((dateOpt) => {
                                                const isSelected = selectedDate === dateOpt.value;
                                                return (
                                                    <motion.button
                                                        key={dateOpt.value}
                                                        type="button"
                                                        onClick={() => handleDateSelect(dateOpt.value)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`relative p-4 rounded-2xl border-2 text-center transition-all ${isSelected
                                                            ? 'border-comet-blue bg-comet-blue/20 shadow-lg shadow-comet-blue/20'
                                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div className={`text-xs font-medium mb-1 ${isSelected ? 'text-comet-blue' : 'text-slate-400'}`}>
                                                            {dateOpt.dayName}요일
                                                        </div>
                                                        <div className={`text-2xl font-extrabold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                            {dateOpt.day}
                                                        </div>
                                                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-300' : 'text-slate-500'}`}>
                                                            {dateOpt.month}월
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 시간 선택 - 그리드 버튼 */}
                                    <AnimatePresence>
                                        {selectedDate && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <label className="block text-sm font-medium text-slate-300 mb-3">⏰ 시간 선택</label>

                                                {morningTimes.length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="text-xs text-slate-500 mb-2 font-medium">오전</div>
                                                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                                            {morningTimes.map((time) => {
                                                                const taken = isSlotTaken(selectedDate, time);
                                                                const takenIdx = getSlotPriority(selectedDate, time);
                                                                const isMine = takenIdx === currentPriority;

                                                                return (
                                                                    <motion.button
                                                                        key={time}
                                                                        type="button"
                                                                        onClick={() => !taken || isMine ? handleTimeSelect(time) : null}
                                                                        whileHover={!taken || isMine ? { scale: 1.08 } : {}}
                                                                        whileTap={!taken || isMine ? { scale: 0.95 } : {}}
                                                                        disabled={taken && !isMine}
                                                                        className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all ${isMine
                                                                            ? `${PRIORITY_COLORS[currentPriority].bg} text-white shadow-lg`
                                                                            : taken
                                                                                ? `bg-white/5 text-slate-600 cursor-not-allowed border border-white/5`
                                                                                : 'bg-white/5 text-white border border-white/10 hover:bg-comet-blue/20 hover:border-comet-blue/40 hover:text-comet-blue'
                                                                            }`}
                                                                    >
                                                                        {time}
                                                                        {taken && !isMine && (
                                                                            <div className={`text-[10px] mt-0.5 ${PRIORITY_COLORS[takenIdx].text}`}>
                                                                                {PRIORITY_COLORS[takenIdx].label}
                                                                            </div>
                                                                        )}
                                                                    </motion.button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {afternoonTimes.length > 0 && (
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-2 font-medium">오후</div>
                                                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                                            {afternoonTimes.map((time) => {
                                                                const taken = isSlotTaken(selectedDate, time);
                                                                const takenIdx = getSlotPriority(selectedDate, time);
                                                                const isMine = takenIdx === currentPriority;

                                                                return (
                                                                    <motion.button
                                                                        key={time}
                                                                        type="button"
                                                                        onClick={() => !taken || isMine ? handleTimeSelect(time) : null}
                                                                        whileHover={!taken || isMine ? { scale: 1.08 } : {}}
                                                                        whileTap={!taken || isMine ? { scale: 0.95 } : {}}
                                                                        disabled={taken && !isMine}
                                                                        className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all ${isMine
                                                                            ? `${PRIORITY_COLORS[currentPriority].bg} text-white shadow-lg`
                                                                            : taken
                                                                                ? `bg-white/5 text-slate-600 cursor-not-allowed border border-white/5`
                                                                                : 'bg-white/5 text-white border border-white/10 hover:bg-comet-blue/20 hover:border-comet-blue/40 hover:text-comet-blue'
                                                                            }`}
                                                                    >
                                                                        {time}
                                                                        {taken && !isMine && (
                                                                            <div className={`text-[10px] mt-0.5 ${PRIORITY_COLORS[takenIdx].text}`}>
                                                                                {PRIORITY_COLORS[takenIdx].label}
                                                                            </div>
                                                                        )}
                                                                    </motion.button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ) : null}

                            {/* 에러/성공 메시지 */}
                            <AnimatePresence>
                                {errorMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-4"
                                    >
                                        ⚠️ {errorMsg}
                                    </motion.div>
                                )}
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-center"
                                    >
                                        <div className="text-3xl mb-2">🎉</div>
                                        <div className="font-bold text-lg mb-1">제출 완료!</div>
                                        <div className="text-sm">{successMsg}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 제출 버튼 */}
                            {!successMsg && (
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || !allSelected}
                                    whileHover={allSelected ? { scale: 1.01 } : {}}
                                    whileTap={allSelected ? { scale: 0.99 } : {}}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${allSelected
                                        ? 'bg-gradient-to-r from-comet-blue to-nebula-purple text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] cursor-pointer'
                                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            제출 중...
                                        </span>
                                    ) : allSelected ? (
                                        '면접 일정 제출하기'
                                    ) : (
                                        `${selections.filter(s => s !== null).length}/3 선택됨 — 3개 순위를 모두 선택해주세요`
                                    )}
                                </motion.button>
                            )}
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default InterviewSchedulePage;
