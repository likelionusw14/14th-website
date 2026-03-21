import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../../../shared/context/AuthContext';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';

interface ActivateFormProps {
    studentId: string;
    verificationToken: string;
    portalName: string;
    activationName: string;
    phoneLastDigits: string;
    onSuccess: () => void;
}

const ActivateForm = ({ studentId, verificationToken, portalName, activationName, phoneLastDigits, onSuccess }: ActivateFormProps) => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: activationName,
                    phoneLastDigits,
                    verificationToken,
                    customPassword: data.password
                }),
            });
            const result = await response.json();

            if (result.success) {
                alert('계정이 활성화되었습니다. 로그인해주세요.');
                onSuccess();
            } else {
                setErrorMsg(result.message || '계정 활성화 실패');
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
            <h2 className="text-2xl font-bold text-center text-white mb-2">계정 활성화</h2>
            <p className="text-center text-slate-400 text-sm mb-6">{portalName}님, 최종합격을 축하합니다!<br />사이트 사용을 위한 비밀번호를 설정해주세요.</p>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
                <div className="text-sm text-slate-400 mb-1">이름 (포털에서 가져옴)</div>
                <div className="text-white font-semibold">{portalName}</div>
                <div className="text-xs text-slate-500 mt-1">학번: {studentId}</div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">사이트 비밀번호</Label>
                <Input
                    id="password"
                    type="password"
                    {...register('password', { required: '비밀번호를 입력해주세요', minLength: { value: 6, message: '6자 이상 입력해주세요' } })}
                />
                {errors.password && <span className="text-red-400 text-xs">{errors.password.message as string}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword', {
                        required: true,
                        validate: (val: string) => {
                            if (watch('password') !== val) {
                                return "비밀번호가 일치하지 않습니다";
                            }
                        }
                    })}
                />
                {errors.confirmPassword && <span className="text-red-400 text-xs">{errors.confirmPassword.message as string}</span>}
            </div>

            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400"
                size="lg"
            >
                계정 활성화 완료
            </Button>
        </motion.form>
    );
};

export default ActivateForm;
