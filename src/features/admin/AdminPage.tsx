import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, API_BASE_URL } from '../../shared/context/AuthContext';
import StarBackground from '../../shared/ui/StarBackground';

interface Application {
    id: number;
    track: 'FRONTEND' | 'BACKEND';
    content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    user: {
        id: number;
        studentId: string;
        name: string | null;
        major: string | null;
    };
}

interface Session {
    id: number;
    code: string;
    description: string | null;
    openTime: string;
    isActive: boolean;
    attendanceCount: number;
    attendances: Array<{
        id: number;
        status: string;
        timestamp: string;
        user: {
            id: number;
            studentId: string;
            name: string | null;
            major: string | null;
        };
    }>;
}

const AdminPage = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'applications' | 'attendance'>('applications');
    const [applications, setApplications] = useState<Application[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [newSessionDescription, setNewSessionDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (token) {
            if (activeTab === 'applications') {
                fetchApplications();
            } else {
                fetchSessions();
            }
        }
    }, [token, activeTab]);

    const fetchApplications = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setApplications(result.applications);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/attendance/sessions', {
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

    const handleApplicationStatus = async (applicationId: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg(`지원서가 ${status === 'APPROVED' ? '승인' : '거절'}되었습니다.`);
                fetchApplications();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '처리 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ description: newSessionDescription || null })
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg(`새 세션이 생성되었습니다. 코드: ${result.session.code}`);
                setNewSessionDescription('');
                fetchSessions();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '세션 생성 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleCloseSession = async (sessionId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions/${sessionId}/close`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('세션이 종료되었습니다.');
                fetchSessions();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '세션 종료 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleReactivateSession = async (sessionId: number) => {
        if (!confirm('세션을 재활성화하시겠습니까?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions/${sessionId}/reactivate`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('세션이 재활성화되었습니다.');
                fetchSessions();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '세션 재활성화 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        if (!confirm('세션을 삭제하시겠습니까? 출석 기록도 함께 삭제됩니다.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('세션이 삭제되었습니다.');
                fetchSessions();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '세션 삭제 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleExportExcel = async (sessionId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions/${sessionId}/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const result = await response.json();
                setErrorMsg(result.message || '엑셀 다운로드 실패');
                setTimeout(() => setErrorMsg(''), 3000);
                return;
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = '출석명단.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = decodeURIComponent(filenameMatch[1]);
                }
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setSuccessMsg('엑셀 파일이 다운로드되었습니다.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'text-green-400 bg-green-500/20';
            case 'REJECTED':
                return 'text-red-400 bg-red-500/20';
            default:
                return 'text-yellow-400 bg-yellow-500/20';
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

            <div className="max-w-6xl mx-auto relative z-10 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <h1 className="text-3xl font-bold text-white mb-6">관리자 페이지</h1>

                        {/* 탭 */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setActiveTab('applications')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    activeTab === 'applications'
                                        ? 'bg-comet-blue text-white'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                지원서 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('attendance')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    activeTab === 'attendance'
                                        ? 'bg-comet-blue text-white'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                출석 관리
                            </button>
                        </div>

                        {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs mb-4">{errorMsg}</div>}
                        {successMsg && <div className="p-3 rounded bg-green-500/20 text-green-300 text-xs mb-4">{successMsg}</div>}

                        {/* 지원서 관리 */}
                        {activeTab === 'applications' && (
                            <div className="space-y-4">
                                {applications.length === 0 ? (
                                    <div className="text-slate-400 text-center py-8">지원서가 없습니다.</div>
                                ) : (
                                    applications.map((app) => (
                                        <div key={app.id} className="p-6 rounded-lg bg-white/5 border border-white/10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="font-semibold text-white text-lg">
                                                        {app.user.name || app.user.studentId}
                                                    </div>
                                                    <div className="text-sm text-slate-400 mt-1">
                                                        {app.user.studentId} · {app.user.major || '전공 미입력'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {new Date(app.createdAt).toLocaleString('ko-KR')}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                        {app.status === 'PENDING' ? '대기 중' : app.status === 'APPROVED' ? '승인됨' : '거절됨'}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                                        {app.track === 'FRONTEND' ? '프론트엔드' : '백엔드'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 mb-4">
                                                <p className="text-slate-300 whitespace-pre-wrap">{app.content}</p>
                                            </div>
                                            {app.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.id, 'APPROVED')}
                                                        className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all font-semibold"
                                                    >
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.id, 'REJECTED')}
                                                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                                                    >
                                                        거절
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* 출석 관리 */}
                        {activeTab === 'attendance' && (
                            <div className="space-y-6">
                                {/* 세션 생성 */}
                                <form onSubmit={handleCreateSession} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <h3 className="text-white font-semibold mb-4">새 출석 세션 생성</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSessionDescription}
                                            onChange={(e) => setNewSessionDescription(e.target.value)}
                                            placeholder="세션 설명 (선택사항)"
                                            className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-lg bg-comet-blue text-white font-semibold hover:bg-comet-blue/80 transition-all"
                                        >
                                            생성
                                        </button>
                                    </div>
                                </form>

                                {/* 세션 목록 */}
                                <div className="space-y-4">
                                    {sessions.length === 0 ? (
                                        <div className="text-slate-400 text-center py-8">세션이 없습니다.</div>
                                    ) : (
                                        sessions.map((session) => (
                                            <div key={session.id} className="p-6 rounded-lg bg-white/5 border border-white/10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="font-semibold text-white text-lg">
                                                            코드: <span className="text-2xl tracking-widest">{session.code}</span>
                                                        </div>
                                                        {session.description && (
                                                            <div className="text-sm text-slate-400 mt-1">{session.description}</div>
                                                        )}
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            시작: {new Date(session.openTime).toLocaleString('ko-KR')}
                                                        </div>
                                                        <div className="text-sm text-slate-300 mt-2">
                                                            출석 인원: {session.attendanceCount}명
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 items-end">
                                                        <div className="flex gap-2">
                                                            {session.isActive ? (
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                                                                    활성
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">
                                                                    종료
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {session.attendanceCount > 0 && (
                                                                <button
                                                                    onClick={() => handleExportExcel(session.id)}
                                                                    className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all text-xs font-semibold"
                                                                >
                                                                    엑셀 다운로드
                                                                </button>
                                                            )}
                                                            {session.isActive ? (
                                                                <button
                                                                    onClick={() => handleCloseSession(session.id)}
                                                                    className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs font-semibold"
                                                                >
                                                                    종료
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleReactivateSession(session.id)}
                                                                    className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-xs font-semibold"
                                                                >
                                                                    재활성화
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteSession(session.id)}
                                                                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs font-semibold"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {session.attendances.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-white/10">
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">출석자 목록</h4>
                                                        <div className="space-y-2">
                                                            {session.attendances.map((att) => (
                                                                <div key={att.id} className="flex items-center justify-between text-sm">
                                                                    <span className="text-slate-300">
                                                                        {att.user.name || att.user.studentId} ({att.user.studentId})
                                                                    </span>
                                                                    <span className="text-xs text-slate-500">
                                                                        {new Date(att.timestamp).toLocaleString('ko-KR')}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminPage;

