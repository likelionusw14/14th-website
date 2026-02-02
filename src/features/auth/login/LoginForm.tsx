import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../../../shared/context/AuthContext';

const LoginForm = ({ onRegisterClick }: { onRegisterClick: () => void }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const onSubmit = async (data: any) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:11',message:'Login submit started',data:{hasStudentId:!!data.studentId,hasPassword:!!data.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setErrorMsg('');
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:15',message:'Sending login request',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: data.studentId, password: data.password }),
            });
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:22',message:'Login response received',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            const result = await response.json();
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:25',message:'Result parsed',data:{success:result.success,hasToken:!!result.token,hasUser:!!result.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            if (result.success) {
                login(result.token, result.user);
                navigate('/');
            } else {
                setErrorMsg(result.message || '로그인 실패');
            }
        } catch (err) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:32',message:'Login error caught',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
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
                <label className="block text-sm font-medium text-slate-300 mb-1">비밀번호</label>
                <input
                    type="password"
                    {...register('password', { required: '비밀번호를 입력해주세요' })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue focus:ring-1 focus:ring-comet-blue transition-all"
                    placeholder="********"
                />
                {errors.password && <span className="text-red-400 text-xs mt-1">{errors.password.message as string}</span>}
            </div>

            {errorMsg && <div className="p-3 rounded bg-red-500/20 text-red-300 text-xs">{errorMsg}</div>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg text-white font-bold hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50"
            >
                {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            <div className="text-center mt-4 text-sm text-slate-400">
                계정이 없으신가요? <button type="button" onClick={onRegisterClick} className="text-comet-blue hover:underline">회원가입 (포털인증)</button>
            </div>
        </motion.form>
    );
};

export default LoginForm;
