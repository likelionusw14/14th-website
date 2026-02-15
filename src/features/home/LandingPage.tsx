import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';
import { API_BASE_URL } from '../../shared/context/AuthContext';

const LandingPage = () => {
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
        <div className="relative min-h-screen w-full overflow-hidden bg-deep-navy">
            <StarBackground />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"
                />

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
                        Possibility to
                    </span>
                    <br />
                    <span className="text-gradient-lion">
                        Reality
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed"
                >
                    수원대학교 멋쟁이사자처럼 14기<br />
                    우리는 코딩이라는 무한한 우주를 탐험합니다.
                </motion.p>

                {isLoading ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-slate-500 font-semibold"
                    >
                        로딩 중...
                    </motion.div>
                ) : googleFormUrl ? (
                    <motion.a
                        href={googleFormUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="inline-block px-8 py-4 btn-gradient-lion rounded-full cursor-pointer"
                    >
                        🦁 미션 합류하기
                    </motion.a>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-slate-500 font-semibold cursor-not-allowed"
                    >
                        준비 중...
                    </motion.div>
                )}
            </section>

            {/* Tracks / Introduction */}
            <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Galaxy Tracks</h2>
                    <p className="text-slate-400">당신의 행성을 선택하고 여정을 시작하세요.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Frontend Track */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="group relative p-8 rounded-3xl glass overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px] group-hover:bg-purple-500/40 transition-all" />
                        <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors">Frontend</h3>
                        <p className="text-slate-400 mb-6">눈에 보이는 우주를 구축합니다. React, TypeScript, 그리고 UI/UX.</p>
                        <div className="h-40 bg-gradient-to-br from-purple-900/50 to-slate-900/50 rounded-xl flex items-center justify-center border border-white/5">
                            <span className="text-4xl">🪐</span>
                        </div>
                    </motion.div>

                    {/* Backend Track */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="group relative p-8 rounded-3xl glass overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] group-hover:bg-blue-500/40 transition-all" />
                        <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">Backend</h3>
                        <p className="text-slate-400 mb-6">핵심 로직을 설계합니다. Spring Boot, Django, 그리고 서버 인프라.</p>
                        <div className="h-40 bg-gradient-to-br from-blue-900/50 to-slate-900/50 rounded-xl flex items-center justify-center border border-white/5">
                            <span className="text-4xl">🛰️</span>
                        </div>
                    </motion.div>

                    {/* Design Track */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="group relative p-8 rounded-3xl glass overflow-hidden border border-white/10 hover:border-pink-500/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-[40px] group-hover:bg-pink-500/40 transition-all" />
                        <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-pink-300 transition-colors">Design</h3>
                        <p className="text-slate-400 mb-6">아름다운 경험을 디자인합니다. Figma, 프로토타이핑, 그리고 사용자 중심 설계.</p>
                        <div className="h-40 bg-gradient-to-br from-pink-900/50 to-slate-900/50 rounded-xl flex items-center justify-center border border-white/5">
                            <span className="text-4xl">🎨</span>
                        </div>
                    </motion.div>

                    {/* PM Track */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="group relative p-8 rounded-3xl glass overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-[40px] group-hover:bg-yellow-500/40 transition-all" />
                        <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-yellow-300 transition-colors">PM</h3>
                        <p className="text-slate-400 mb-6">프로젝트를 이끌어갑니다. 기획, 관리, 그리고 팀 협업.</p>
                        <div className="h-40 bg-gradient-to-br from-yellow-900/50 to-slate-900/50 rounded-xl flex items-center justify-center border border-white/5">
                            <span className="text-4xl">🚀</span>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default LandingPage;
