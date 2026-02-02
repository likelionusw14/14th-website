import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, API_BASE_URL } from '../../shared/context/AuthContext';
import StarBackground from '../../shared/ui/StarBackground';

interface Session {
    id: number;
    code: string;
    description: string | null;
    openTime: string;
    host: {
        name: string | null;
        studentId: string;
    } | null;
}

interface Attendance {
    id: number;
    status: string;
    timestamp: string;
    session: {
        id: number;
        code: string;
        description: string | null;
        openTime: string;
    };
}

const AttendancePage = () => {
    const { user, token } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);
    const [sessionCode, setSessionCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && token) {
            fetchActiveSessions();
            fetchMyAttendances();
        }
    }, [user, token]);

    const fetchActiveSessions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setSessions(result.sessions);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyAttendances = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setMyAttendances(result.attendances);
            }
        } catch (error) {
            console.error('Failed to fetch attendances:', error);
        }
    };

    const handleJoinSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!sessionCode.trim()) {
            setErrorMsg('세션 코드를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions/${sessionCode.toUpperCase()}/join`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('출석이 완료되었습니다!');
                setSessionCode('');
                fetchActiveSessions();
                fetchMyAttendances();
            } else {
                setErrorMsg(result.message || '출석 처리에 실패했습니다.');
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-navy">
                <div className="text-white">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 relative overflow-hidden bg-deep-navy">
            <StarBackground />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* 출석 체크 섹션 */}
                    <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <h1 className="text-3xl font-bold text-white mb-2">출석 체크</h1>
                        <p className="text-slate-400 mb-6">운영진이 제공한 세션 코드를 입력하여 출석하세요.</p>

                        <form onSubmit={handleJoinSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">세션 코드</label>
                                <input
                                    type="text"
                                    value={sessionCode}
                                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                    placeholder="예: ABC123"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all text-center text-2xl font-bold tracking-widest"
                                    maxLength={6}
                                />
                            </div>

                            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}
                            {successMsg && <div className="p-3 rounded bg-green-500/20 text-green-300 text-xs">{successMsg}</div>}

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-comet-blue to-nebula-purple rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all"
                            >
                                출석하기
                            </button>
                        </form>
                    </div>

                    {/* 활성 세션 목록 */}
                    {sessions.length > 0 && (
                        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-4">활성 세션</h2>
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div key={session.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                {session.description ? (
                                                    <>
                                                        <div className="font-semibold text-white text-lg">{session.description}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {new Date(session.openTime).toLocaleString('ko-KR')}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-sm text-slate-400">
                                                            {new Date(session.openTime).toLocaleString('ko-KR')}
                                                        </div>
                                                        {session.host && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                호스트: {session.host.name || session.host.studentId}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 내 출석 기록 */}
                    <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">내 출석 기록</h2>
                        {myAttendances.length === 0 ? (
                            <div className="text-slate-400 text-center py-8">출석 기록이 없습니다.</div>
                        ) : (
                            <div className="space-y-3">
                                {myAttendances.map((attendance) => (
                                    <div key={attendance.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                {attendance.session.description ? (
                                                    <>
                                                        <div className="font-semibold text-white text-lg">{attendance.session.description}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            출석 시간: {new Date(attendance.timestamp).toLocaleString('ko-KR')}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-slate-400">
                                                        {new Date(attendance.timestamp).toLocaleString('ko-KR')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
                                                출석
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AttendancePage;

