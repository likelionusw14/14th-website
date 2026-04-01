import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../../../shared/context/AuthContext';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';

const LoginForm = ({ onRegisterClick, onResetClick, onRelinkNeeded }: { onRegisterClick: () => void; onResetClick: () => void; onRelinkNeeded: () => void }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: data.studentId, password: data.password }),
            });
            const result = await response.json();

            if (result.success) {
                login(result.token, result.user);
                if (result.user.name === 'Baby Lion' || !result.user.name) {
                    onRelinkNeeded();
                } else {
                    navigate('/');
                }
            } else {
                setErrorMsg(result.message || '로그인 실패');
            }
        } catch (err) {
            setErrorMsg('서버 오류 발생');
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-center text-white mb-2">Login</h2>
            <p className="text-center text-slate-400 text-sm mb-6">LIKELION USW Universe에 오신 것을 환영합니다.</p>

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
                <Label htmlFor="password">비밀번호</Label>
                <Input
                    id="password"
                    type="password"
                    {...register('password', { required: '비밀번호를 입력해주세요' })}
                    placeholder="********"
                />
                {errors.password && <span className="text-red-400 text-xs">{errors.password.message as string}</span>}
            </div>

            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
                size="lg"
            >
                {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>

            <div className="text-center mt-4 text-sm text-slate-400">
                계정이 없으신가요? <button type="button" onClick={onRegisterClick} className="text-comet-blue hover:underline">회원가입 (포털인증)</button>
            </div>

            <div className="text-center mt-2 text-sm text-slate-400">
                비밀번호를 잊으셨나요? <button type="button" onClick={onResetClick} className="text-comet-blue hover:underline">비밀번호 재설정</button>
            </div>

            <div className="text-center mt-4 text-sm text-slate-400">
                <button type="button" onClick={() => navigate('/')} className="text-comet-blue hover:underline">홈으로 돌아가기</button>
            </div>
        </motion.form>
    );
};

export default LoginForm;
