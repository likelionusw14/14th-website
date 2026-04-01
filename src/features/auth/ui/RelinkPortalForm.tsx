import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../../../shared/context/AuthContext';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';

const RelinkPortalForm = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const { token, login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/relink-portal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ portalPassword: data.portalPassword }),
            });
            const result = await response.json();

            if (result.success) {
                login(token!, result.user);
                alert('포털 연동이 완료되었습니다.');
                navigate('/');
            } else {
                setErrorMsg(result.message || '포털 연동 실패');
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
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-2">
                <h3 className="text-yellow-400 font-semibold text-sm mb-1">포털 연동 필요</h3>
                <p className="text-slate-400 text-xs">
                    포털 연동이 완료되지 않아 이름과 학과 정보가 등록되지 않았습니다.
                    <br />포털 비밀번호를 입력하여 정보를 연동해주세요.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="portalPassword">포털 비밀번호</Label>
                <Input
                    id="portalPassword"
                    type="password"
                    {...register('portalPassword', { required: '포털 비밀번호를 입력해주세요' })}
                    placeholder="수원대학교 포털 비밀번호"
                />
                {errors.portalPassword && <span className="text-red-400 text-xs">{errors.portalPassword.message as string}</span>}
            </div>

            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-comet-blue to-nebula-purple hover:from-comet-blue/90 hover:to-nebula-purple/90"
                size="lg"
            >
                {isSubmitting ? '연동 중...' : '포털 연동하기'}
            </Button>

            <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
                나중에 하기
            </button>
        </motion.form>
    );
};

export default RelinkPortalForm;
