import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../../../shared/constants/terms';

interface TermsAgreementProps {
    register: any;
    errors: any;
}

const TermsAgreement = ({ register, errors }: TermsAgreementProps) => {
    const [openTerms, setOpenTerms] = useState(false);
    const [openPrivacy, setOpenPrivacy] = useState(false);

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {/* 이용약관 동의 */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="termsAgreement"
                        {...register('termsAgreement', {
                            required: '이용약관에 동의해주세요.'
                        })}
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
                {errors.termsAgreement && (
                    <span className="text-red-400 text-xs ml-7">{errors.termsAgreement.message as string}</span>
                )}

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
                        {...register('privacyAgreement', {
                            required: '개인정보 처리방침에 동의해주세요.'
                        })}
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
                {errors.privacyAgreement && (
                    <span className="text-red-400 text-xs ml-7">{errors.privacyAgreement.message as string}</span>
                )}

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
        </div>
    );
};

export default TermsAgreement;

