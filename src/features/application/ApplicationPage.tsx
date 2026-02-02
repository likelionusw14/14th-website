import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth, API_BASE_URL } from '../../shared/context/AuthContext';
import StarBackground from '../../shared/ui/StarBackground';

interface Application {
    id: number;
    track: 'FRONTEND' | 'BACKEND';
    content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

const ApplicationPage = () => {
    const { user, token } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [application, setApplication] = useState<Application | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && token) {
            fetchMyApplication();
        }
    }, [user, token]);

    const fetchMyApplication = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setApplication(result.application);
            }
        } catch (error) {
            console.error('Failed to fetch application:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    track: data.track,
                    content: data.content
                })
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('지원서가 제출되었습니다. 운영진의 검토 후 승인 여부가 결정됩니다.');
                fetchMyApplication();
            } else {
                setErrorMsg(result.message || '지원서 제출에 실패했습니다.');
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
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

    const getStatusText = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return '승인됨';
            case 'REJECTED':
                return '거절됨';
            default:
                return '대기 중';
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
                    className="glass p-8 rounded-3xl border border-white/10 shadow-2xl"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">지원서 제출</h1>
                    <p className="text-slate-400 mb-8">멋쟁이사자처럼 14기에 지원해주세요!</p>

                    {application ? (
                        <div className="space-y-6">
                            <div className={`p-4 rounded-lg ${getStatusColor(application.status)}`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">현재 상태: {getStatusText(application.status)}</span>
                                    <span className="text-sm">트랙: {application.track === 'FRONTEND' ? '프론트엔드' : '백엔드'}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <h3 className="text-white font-semibold mb-2">지원 내용</h3>
                                <p className="text-slate-300 whitespace-pre-wrap">{application.content}</p>
                            </div>

                            <div className="text-sm text-slate-400">
                                제출일: {new Date(application.createdAt).toLocaleString('ko-KR')}
                            </div>

                            {application.status === 'PENDING' && (
                                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                                    운영진의 검토 중입니다. 승인되면 아기사자 역할이 부여됩니다.
                                </div>
                            )}

                            {application.status === 'APPROVED' && (
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300">
                                    축하합니다! 지원서가 승인되었습니다. 이제 아기사자로 활동하실 수 있습니다.
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">트랙 선택</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="relative">
                                        <input
                                            type="radio"
                                            value="FRONTEND"
                                            {...register('track', { required: '트랙을 선택해주세요' })}
                                            className="peer hidden"
                                        />
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-comet-blue transition-all peer-checked:border-comet-blue peer-checked:bg-comet-blue/10">
                                            <div className="font-semibold text-white">프론트엔드</div>
                                            <div className="text-sm text-slate-400 mt-1">React, TypeScript, UI/UX</div>
                                        </div>
                                    </label>
                                    <label className="relative">
                                        <input
                                            type="radio"
                                            value="BACKEND"
                                            {...register('track', { required: '트랙을 선택해주세요' })}
                                            className="peer hidden"
                                        />
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-comet-blue transition-all peer-checked:border-comet-blue peer-checked:bg-comet-blue/10">
                                            <div className="font-semibold text-white">백엔드</div>
                                            <div className="text-sm text-slate-400 mt-1">Node.js, Database, API</div>
                                        </div>
                                    </label>
                                </div>
                                {errors.track && <span className="text-red-400 text-xs mt-1">{errors.track.message as string}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">지원 동기 및 자기소개</label>
                                <textarea
                                    {...register('content', {
                                        required: '지원 내용을 입력해주세요',
                                        minLength: { value: 50, message: '최소 50자 이상 입력해주세요' }
                                    })}
                                    rows={10}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all resize-none"
                                    placeholder="지원 동기, 관심 분야, 기대하는 점 등을 자유롭게 작성해주세요..."
                                />
                                {errors.content && <span className="text-red-400 text-xs mt-1">{errors.content.message as string}</span>}
                            </div>

                            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}
                            {successMsg && <div className="p-3 rounded bg-green-500/20 text-green-300 text-xs">{successMsg}</div>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-comet-blue to-nebula-purple rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? '제출 중...' : '지원서 제출'}
                            </button>
                        </motion.form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ApplicationPage;

