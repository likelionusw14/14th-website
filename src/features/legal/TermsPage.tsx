import { motion } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';
import { TERMS_OF_SERVICE } from '../../shared/constants/terms';

const TermsPage = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-deep-navy">
            <StarBackground />

            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 z-10 pt-24 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl w-full mx-auto"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
                            이용약관
                        </span>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="glass p-8 rounded-3xl border border-white/10"
                    >
                        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed text-sm md:text-base">
                            {TERMS_OF_SERVICE}
                        </div>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
};

export default TermsPage;

