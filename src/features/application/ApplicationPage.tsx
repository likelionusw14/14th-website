import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';
import { API_BASE_URL } from '../../shared/context/AuthContext';

const ApplicationPage = () => {
    const [googleFormUrl, setGoogleFormUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGoogleFormUrl();
    }, []);

    const fetchGoogleFormUrl = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/application/google-form-url`);
            const result = await response.json();
            if (result.success) {
                setGoogleFormUrl(result.googleFormUrl);
            }
        } catch (error) {
            console.error('Failed to fetch google form URL:', error);
        } finally {
            setIsLoading(false);
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
                    <h1 className="text-3xl font-bold text-white mb-2">지원서 제출</h1>
                    <p className="text-slate-400 mb-8">멋쟁이사자처럼 14기에 지원해주세요!</p>

                    <div className="space-y-6">
                        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                            <h3 className="text-white font-semibold mb-4">지원 방법</h3>
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
                        </div>

                        <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
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
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ApplicationPage;

