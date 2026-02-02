import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../../../shared/context/AuthContext';

interface PortalVerificationProps {
    onVerified: (token: string, studentId: string, name: string) => void;
}

const PortalVerificationForm = ({ onVerified }: PortalVerificationProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: data.studentId, portalPassword: data.portalPassword }),
            });
            const result = await response.json();

            if (result.success) {
                onVerified(result.verificationToken, data.studentId, result.name || '');
            } else {
                setErrorMsg(result.message || '인증에 실패했습니다. 학번과 비밀번호를 확인해주세요.');
            }
        } catch (err) {
            setErrorMsg('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-white mb-2">포털 인증</h2>
            <p className="text-center text-slate-400 text-sm mb-6">수원대학교 포털 계정으로 본인 인증을 진행합니다.</p>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">학번</label>
                <input
                    {...register('studentId', { required: '학번을 입력해주세요' })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                    placeholder="22000000"
                />
                {errors.studentId && <span className="text-red-400 text-xs mt-1">{errors.studentId.message as string}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">포털 비밀번호</label>
                <input
                    type="password"
                    {...register('portalPassword', { required: '비밀번호를 입력해주세요' })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                    placeholder="********"
                />
                {errors.portalPassword && <span className="text-red-400 text-xs mt-1">{errors.portalPassword.message as string}</span>}
            </div>

            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-comet-blue to-nebula-purple rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
            >
                {isSubmitting ? '인증 확인 중...' : '인증하기'}
            </button>
        </motion.form>
    );
};

export default PortalVerificationForm;
