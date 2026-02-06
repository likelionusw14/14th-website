import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, API_BASE_URL } from '../../shared/context/AuthContext';
import StarBackground from '../../shared/ui/StarBackground';

interface Application {
    id: number;
    track: 'FRONTEND' | 'BACKEND' | 'DESIGN' | 'PM';
    content: string;
    status: 'PENDING' | 'DOCUMENT_APPROVED' | 'INTERVIEW_APPROVED' | 'REJECTED';
    phoneLastDigits?: string | null;
    interviewPreferences?: {
        times: Array<{ priority: number; date: string; time: string }>;
    } | null;
    confirmedInterviewDate?: string | null;
    confirmedInterviewTime?: string | null;
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
    const [activeTab, setActiveTab] = useState<'applications' | 'attendance' | 'settings'>('applications');
    const [applications, setApplications] = useState<Application[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [newSessionDescription, setNewSessionDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [resultOpenDate, setResultOpenDate] = useState('');
    const [googleFormUrl, setGoogleFormUrl] = useState('');
    const [confirmingAppId, setConfirmingAppId] = useState<number | null>(null);
    const [confirmDate, setConfirmDate] = useState('');
    const [confirmTime, setConfirmTime] = useState('');
    const [googleSheetId, setGoogleSheetId] = useState('');
    const [sheetName, setSheetName] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importResults, setImportResults] = useState<any>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newApplication, setNewApplication] = useState({
        studentId: '',
        name: '',
        phoneLastDigits: '',
        track: 'FRONTEND' as 'FRONTEND' | 'BACKEND' | 'DESIGN' | 'PM'
    });

    useEffect(() => {
        if (token) {
            if (activeTab === 'applications') {
                fetchApplications();
            } else if (activeTab === 'attendance') {
                fetchSessions();
            } else if (activeTab === 'settings') {
                fetchSettings();
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
            const response = await fetch(`${API_BASE_URL}/api/attendance/sessions`, {
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

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success && result.settings) {
                const date = new Date(result.settings.resultOpenDate);
                setResultOpenDate(date.toISOString().split('T')[0]);
                setGoogleFormUrl(result.settings.googleFormUrl || '');
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!resultOpenDate) {
            setErrorMsg('결과 공개일을 입력해주세요');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/application/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    resultOpenDate,
                    googleFormUrl: googleFormUrl || null
                })
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('설정이 저장되었습니다');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '설정 저장 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleConfirmInterview = async (applicationId: number) => {
        if (!confirmDate || !confirmTime) {
            setErrorMsg('날짜와 시간을 모두 입력해주세요');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/application/${applicationId}/interview-confirm`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: confirmDate,
                    time: confirmTime
                })
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('면접 일정이 확정되었습니다');
                setConfirmingAppId(null);
                setConfirmDate('');
                setConfirmTime('');
                fetchApplications();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '확정 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleImportFromGoogleForm = async () => {
        if (!googleSheetId) {
            setErrorMsg('구글 시트 ID를 입력해주세요');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        setIsImporting(true);
        setErrorMsg('');
        setSuccessMsg('');
        setImportResults(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/application/import-from-google-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    spreadsheetId: googleSheetId,
                    sheetName: sheetName || undefined
                })
            });
            const result = await response.json();

            if (result.success) {
                setImportResults(result.results);
                setSuccessMsg(`가져오기 완료: ${result.results.imported}개 등록, ${result.results.skipped}개 스킵`);
                fetchApplications();
                setTimeout(() => setSuccessMsg(''), 5000);
            } else {
                setErrorMsg(result.message || '가져오기 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다');
            setTimeout(() => setErrorMsg(''), 3000);
        } finally {
            setIsImporting(false);
        }
    };

    const handleCreateApplication = async () => {
        if (!newApplication.studentId || !newApplication.name || !newApplication.phoneLastDigits || !newApplication.track) {
            setErrorMsg('모든 필수 항목을 입력해주세요');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        if (!/^\d{4}$/.test(newApplication.phoneLastDigits)) {
            setErrorMsg('전화번호 뒷자리는 4자리 숫자여야 합니다');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/application/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newApplication,
                    content: '구글폼 제출' // 기본값
                })
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('지원서가 추가되었습니다');
                setShowAddForm(false);
                setNewApplication({
                    studentId: '',
                    name: '',
                    phoneLastDigits: '',
                    track: 'FRONTEND'
                });
                fetchApplications();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '지원서 추가 실패');
                setTimeout(() => setErrorMsg(''), 3000);
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleApplicationStatus = async (applicationId: number, status: 'DOCUMENT_APPROVED' | 'INTERVIEW_APPROVED' | 'REJECTED') => {
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
                const statusText = status === 'DOCUMENT_APPROVED' ? '서류합격' : status === 'INTERVIEW_APPROVED' ? '최종합격' : '거절';
                setSuccessMsg(`지원서가 ${statusText} 처리되었습니다.`);
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
                return '거절됨';
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
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    activeTab === 'settings'
                                        ? 'bg-comet-blue text-white'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                설정
                            </button>
                        </div>

                        {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs mb-4">{errorMsg}</div>}
                        {successMsg && <div className="p-3 rounded bg-green-500/20 text-green-300 text-xs mb-4">{successMsg}</div>}

                        {/* 지원서 관리 */}
                        {activeTab === 'applications' && (
                            <div className="space-y-4">
                                {/* 지원서 추가 버튼 */}
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-white">지원서 목록</h2>
                                    <button
                                        onClick={() => setShowAddForm(!showAddForm)}
                                        className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all font-semibold"
                                    >
                                        {showAddForm ? '취소' : '+ 지원서 추가'}
                                    </button>
                                </div>

                                {/* 지원서 추가 폼 */}
                                {showAddForm && (
                                    <div className="p-6 rounded-lg bg-white/5 border border-white/10 mb-4">
                                        <h3 className="text-white font-semibold mb-4">새 지원서 추가</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">학번 *</label>
                                                <input
                                                    type="text"
                                                    value={newApplication.studentId}
                                                    onChange={(e) => setNewApplication({ ...newApplication, studentId: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                                    placeholder="2024123456"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">이름 *</label>
                                                <input
                                                    type="text"
                                                    value={newApplication.name}
                                                    onChange={(e) => setNewApplication({ ...newApplication, name: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                                    placeholder="홍길동"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">전화번호 뒷자리 (4자리) *</label>
                                                <input
                                                    type="text"
                                                    maxLength={4}
                                                    value={newApplication.phoneLastDigits}
                                                    onChange={(e) => setNewApplication({ ...newApplication, phoneLastDigits: e.target.value.replace(/\D/g, '') })}
                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                                    placeholder="1234"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">트랙 *</label>
                                                <select
                                                    value={newApplication.track}
                                                    onChange={(e) => setNewApplication({ ...newApplication, track: e.target.value as 'FRONTEND' | 'BACKEND' })}
                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-comet-blue"
                                                >
                                                    <option value="FRONTEND">프론트엔드</option>
                                                    <option value="BACKEND">백엔드</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={handleCreateApplication}
                                                className="px-6 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all font-semibold"
                                            >
                                                추가
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowAddForm(false);
                                                    setNewApplication({
                                                        studentId: '',
                                                        name: '',
                                                        phoneLastDigits: '',
                                                        track: 'FRONTEND'
                                                    });
                                                }}
                                                className="px-6 py-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all font-semibold"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                )}

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
                                                        {getStatusText(app.status)}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                                        {getTrackText(app.track)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 mb-4">
                                                <p className="text-slate-300 whitespace-pre-wrap">{app.content}</p>
                                            </div>

                                            {/* 면접 일정 정보 */}
                                            {(app.status === 'DOCUMENT_APPROVED' || app.status === 'INTERVIEW_APPROVED') && (
                                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                                                    <h4 className="text-white font-semibold mb-2">면접 일정</h4>
                                                    {app.confirmedInterviewDate && app.confirmedInterviewTime ? (
                                                        <div className="text-green-300">
                                                            확정: {new Date(app.confirmedInterviewDate).toLocaleDateString('ko-KR')} {app.confirmedInterviewTime}
                                                        </div>
                                                    ) : app.interviewPreferences ? (
                                                        <div className="space-y-2">
                                                            <div className="text-slate-300">
                                                                면접 일정 후보:
                                                                <ul className="list-disc list-inside mt-1 space-y-1">
                                                                    {app.interviewPreferences.times
                                                                        .sort((a, b) => a.priority - b.priority)
                                                                        .map((t, idx) => (
                                                                            <li key={idx}>
                                                                                {t.priority}순위: {new Date(t.date).toLocaleDateString('ko-KR')} {t.time}
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            </div>
                                                            {confirmingAppId === app.id ? (
                                                                <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                                        <input
                                                                            type="date"
                                                                            value={confirmDate}
                                                                            onChange={(e) => setConfirmDate(e.target.value)}
                                                                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                                                        />
                                                                        <input
                                                                            type="time"
                                                                            value={confirmTime}
                                                                            onChange={(e) => setConfirmTime(e.target.value)}
                                                                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleConfirmInterview(app.id)}
                                                                            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-sm font-semibold"
                                                                        >
                                                                            확정
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setConfirmingAppId(null);
                                                                                setConfirmDate('');
                                                                                setConfirmTime('');
                                                                            }}
                                                                            className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all text-sm font-semibold"
                                                                        >
                                                                            취소
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmingAppId(app.id);
                                                                        // 첫 번째 후보의 날짜와 시간을 기본값으로 설정
                                                                        const firstPreference = app.interviewPreferences?.times
                                                                            .sort((a, b) => a.priority - b.priority)[0];
                                                                        if (firstPreference) {
                                                                            setConfirmDate(firstPreference.date);
                                                                            setConfirmTime(firstPreference.time);
                                                                        }
                                                                    }}
                                                                    className="mt-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all text-sm font-semibold"
                                                                >
                                                                    면접 일정 확정
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 text-sm">면접 일정 미선택</div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 상태 변경 버튼 */}
                                            {app.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.id, 'DOCUMENT_APPROVED')}
                                                        className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all font-semibold"
                                                    >
                                                        서류합격
                                                    </button>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.id, 'REJECTED')}
                                                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                                                    >
                                                        거절
                                                    </button>
                                                </div>
                                            )}
                                            {app.status === 'DOCUMENT_APPROVED' && (
                                                <div className="flex gap-2">
                                                    {app.confirmedInterviewDate && app.confirmedInterviewTime && (
                                                        <button
                                                            onClick={() => handleApplicationStatus(app.id, 'INTERVIEW_APPROVED')}
                                                            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all font-semibold"
                                                        >
                                                            최종합격
                                                        </button>
                                                    )}
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

                        {/* 설정 */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                    <h3 className="text-white font-semibold mb-4">지원서 설정</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">구글폼 링크</label>
                                            <input
                                                type="url"
                                                value={googleFormUrl}
                                                onChange={(e) => setGoogleFormUrl(e.target.value)}
                                                placeholder="https://forms.gle/..."
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">
                                                메인 페이지와 지원서 페이지에 표시될 구글폼 링크를 입력하세요.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">결과 공개일</label>
                                            <input
                                                type="datetime-local"
                                                value={resultOpenDate ? new Date(resultOpenDate + 'T00:00').toISOString().slice(0, 16) : ''}
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    setResultOpenDate(date ? date.split('T')[0] : '');
                                                }}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-comet-blue"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveSettings}
                                            className="px-6 py-2 rounded-lg bg-comet-blue text-white font-semibold hover:bg-comet-blue/80 transition-all"
                                        >
                                            저장
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                    <h3 className="text-white font-semibold mb-4">구글폼 데이터 수동 가져오기</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        구글폼 응답이 저장된 구글 시트에서 데이터를 수동으로 가져와 지원서로 등록합니다.
                                        <br />
                                        <span className="text-yellow-400">※ 필요할 때만 수동으로 실행하세요.</span>
                                        <br />
                                        <br />
                                        구글 시트 ID는 시트 URL에서 확인할 수 있습니다.
                                        <br />
                                        예: https://docs.google.com/spreadsheets/d/<span className="text-yellow-400">여기가_시트_ID</span>/edit
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">구글 시트 ID *</label>
                                            <input
                                                type="text"
                                                value={googleSheetId}
                                                onChange={(e) => setGoogleSheetId(e.target.value)}
                                                placeholder="시트 ID를 입력하세요"
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">시트 이름 (선택사항)</label>
                                            <input
                                                type="text"
                                                value={sheetName}
                                                onChange={(e) => setSheetName(e.target.value)}
                                                placeholder="시트 이름 (기본값: 첫 번째 시트)"
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue"
                                            />
                                        </div>
                                        <button
                                            onClick={handleImportFromGoogleForm}
                                            disabled={isImporting || !googleSheetId}
                                            className="px-6 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isImporting ? '가져오는 중...' : '수동으로 가져오기'}
                                        </button>

                                        {importResults && (
                                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                <h4 className="text-white font-semibold mb-2">가져오기 결과</h4>
                                                <div className="text-sm text-slate-300 space-y-1">
                                                    <div>등록됨: <span className="text-green-400">{importResults.imported}개</span></div>
                                                    <div>스킵됨: <span className="text-yellow-400">{importResults.skipped}개</span></div>
                                                    {importResults.errors.length > 0 && (
                                                        <div className="mt-2">
                                                            <div className="text-red-400 font-semibold">오류:</div>
                                                            <ul className="list-disc list-inside text-xs text-red-300">
                                                                {importResults.errors.slice(0, 5).map((error: string, idx: number) => (
                                                                    <li key={idx}>{error}</li>
                                                                ))}
                                                                {importResults.errors.length > 5 && (
                                                                    <li>... 외 {importResults.errors.length - 5}개 오류</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
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

