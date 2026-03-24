import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../../../shared/context/AuthContext';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';

interface ResetPasswordFormProps {
    onSuccess: () => void;
}

const ResetPasswordForm = ({ onSuccess }: ResetPasswordFormProps) => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: data.studentId,
                    portalPassword: data.portalPassword,
                    newPassword: data.newPassword,
                }),
            });
            const result = await response.json();

            if (result.success) {
                alert('비밀번호가 재설정되었습니다. 로그인해주세요.');
                onSuccess();
            } else {
                setErrorMsg(result.message || '비밀번호 재설정 실패');
            }
        } catch (err) {
            setErrorMsg('서버 오류가 발생했습니다.');
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-white mb-2">비밀번호 재설정</h2>
            <p className="text-center text-slate-400 text-sm mb-6">
                수원대학교 포털 인증을 통해 비밀번호를 재설정합니다.
            </p>

            <div className="space-y-2">
                <Label htmlFor="studentId">학번</Label>
                <Input
                    id="studentId"
                    {...register('studentId', { required: '학번을 입력해주세요' })}
                    placeholder="22000000"
                />
                {errors.studentId && <span className="text-red-400 text-xs">{errors.studentId.message as string}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="portalPassword">포털 비밀번호</Label>
                <Input
                    id="portalPassword"
                    type="password"
                    {...register('portalPassword', { required: '포털 비밀번호를 입력해주세요' })}
                    placeholder="포털 로그인 비밀번호"
                />
                {errors.portalPassword && <span className="text-red-400 text-xs">{errors.portalPassword.message as string}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                    id="newPassword"
                    type="password"
                    {...register('newPassword', { required: '새 비밀번호를 입력해주세요', minLength: { value: 6, message: '6자 이상 입력해주세요' } })}
                />
                {errors.newPassword && <span className="text-red-400 text-xs">{errors.newPassword.message as string}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword', {
                        required: true,
                        validate: (val: string) => {
                            if (watch('newPassword') !== val) {
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
                size="lg"
            >
                {isSubmitting ? '재설정 중...' : '비밀번호 재설정'}
            </Button>
        </motion.form>
    );
};

export default ResetPasswordForm;
