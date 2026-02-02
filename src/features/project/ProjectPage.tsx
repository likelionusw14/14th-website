import { motion } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';

const ProjectPage = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-deep-navy">
            <StarBackground />

            {/* Main Content */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 z-10 pt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"
                />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="mb-8"
                    >
                        <span className="text-8xl">🚧</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
                            프로젝트
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-nebula-purple to-comet-blue">
                            준비 중
                        </span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="space-y-6"
                    >
                        <p className="text-xl md:text-2xl text-slate-300 mb-4 leading-relaxed">
                            서비스 점검 중입니다
                        </p>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            더 나은 서비스를 제공하기 위해<br />
                            프로젝트 페이지를 준비하고 있습니다.
                        </p>
                        <div className="inline-block px-6 py-3 rounded-full bg-white/5 border border-white/20 backdrop-blur-md">
                            <p className="text-sm text-slate-400">
                                추후 생성 예정
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
};

export default ProjectPage;

