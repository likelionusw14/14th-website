import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../../../shared/context/AuthContext';

interface RegisterFormProps {
    studentId: string;
    verificationToken: string;
    name: string;
    onSuccess: () => void;
}

const RegisterForm = ({ studentId, verificationToken, name, onSuccess }: RegisterFormProps) => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    verificationToken,
                    customPassword: data.password
                    // name은 verificationToken에서 자동으로 가져옴
                }),
            });
            const result = await response.json();

            if (result.success) {
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                onSuccess();
            } else {
                setErrorMsg(result.message || '회원가입 실패');
            }
        } catch (err) {
            setErrorMsg('오류가 발생했습니다.');
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-white mb-2">계정 생성</h2>
            <p className="text-center text-slate-400 text-sm mb-6">{name}님, 환영합니다.<br />사이트 사용을 위한 비밀번호를 설정해주세요.</p>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
                <div className="text-sm text-slate-400 mb-1">이름 (포털에서 가져옴)</div>
                <div className="text-white font-semibold">{name}</div>
                <div className="text-xs text-slate-500 mt-1">학번: {studentId}</div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">사이트 비밀번호</label>
                <input
                    type="password"
                    {...register('password', { required: '비밀번호를 입력해주세요', minLength: { value: 6, message: '6자 이상 입력해주세요' } })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                />
                {errors.password && <span className="text-red-400 text-xs mt-1">{errors.password.message as string}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">비밀번호 확인</label>
                <input
                    type="password"
                    {...register('confirmPassword', {
                        required: true,
                        validate: (val: string) => {
                            if (watch('password') !== val) {
                                return "비밀번호가 일치하지 않습니다";
                            }
                        }
                    })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                />
                {errors.confirmPassword && <span className="text-red-400 text-xs mt-1">{errors.confirmPassword.message as string}</span>}
            </div>


            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-nebula-purple to-pink-500 rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all disabled:opacity-50"
            >
                가입 완료
            </button>
        </motion.form>
    );
};

export default RegisterForm;
