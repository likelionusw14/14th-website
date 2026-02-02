import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../../../shared/constants/terms';

interface TermsAgreementStepProps {
    onAgree: () => void;
    onBack: () => void;
}

const TermsAgreementStep = ({ onAgree, onBack }: TermsAgreementStepProps) => {
    const [termsChecked, setTermsChecked] = useState(false);
    const [privacyChecked, setPrivacyChecked] = useState(false);
    const [openTerms, setOpenTerms] = useState(false);
    const [openPrivacy, setOpenPrivacy] = useState(false);

    const canProceed = termsChecked && privacyChecked;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-white mb-2">약관 동의</h2>
            <p className="text-center text-slate-400 text-sm mb-6">서비스 이용을 위해 약관에 동의해주세요.</p>

            <div className="space-y-4">
                {/* 이용약관 동의 */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="termsAgreement"
                        checked={termsChecked}
                        onChange={(e) => setTermsChecked(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-comet-blue focus:ring-2 focus:ring-comet-blue focus:ring-offset-0 focus:ring-offset-transparent"
                    />
                    <label htmlFor="termsAgreement" className="flex-1 text-sm text-slate-300 cursor-pointer">
                        <span className="text-red-400">[필수]</span> 이용약관에 동의합니다.
                        <button
                            type="button"
                            onClick={() => setOpenTerms(!openTerms)}
                            className="ml-2 text-comet-blue hover:text-blue-400 underline text-xs"
                        >
                            {openTerms ? '닫기' : '전체보기'}
                        </button>
                    </label>
                </div>

                {/* 이용약관 내용 */}
                <AnimatePresence>
                    {openTerms && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-7 overflow-hidden"
                        >
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 max-h-60 overflow-y-auto text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                                {TERMS_OF_SERVICE}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 개인정보 처리방침 동의 */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="privacyAgreement"
                        checked={privacyChecked}
                        onChange={(e) => setPrivacyChecked(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-comet-blue focus:ring-2 focus:ring-comet-blue focus:ring-offset-0 focus:ring-offset-transparent"
                    />
                    <label htmlFor="privacyAgreement" className="flex-1 text-sm text-slate-300 cursor-pointer">
                        <span className="text-red-400">[필수]</span> 개인정보 처리방침에 동의합니다.
                        <button
                            type="button"
                            onClick={() => setOpenPrivacy(!openPrivacy)}
                            className="ml-2 text-comet-blue hover:text-blue-400 underline text-xs"
                        >
                            {openPrivacy ? '닫기' : '전체보기'}
                        </button>
                    </label>
                </div>

                {/* 개인정보 처리방침 내용 */}
                <AnimatePresence>
                    {openPrivacy && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-7 overflow-hidden"
                        >
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 max-h-60 overflow-y-auto text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                                {PRIVACY_POLICY}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition-all"
                >
                    이전
                </button>
                <button
                    type="button"
                    onClick={onAgree}
                    disabled={!canProceed}
                    className="flex-1 py-3 bg-gradient-to-r from-comet-blue to-nebula-purple rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    동의하고 계속하기
                </button>
            </div>
        </motion.div>
    );
};

export default TermsAgreementStep;

