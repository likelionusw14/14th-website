import { useState } from 'react';
import StarBackground from '../../../shared/ui/StarBackground';
import PortalVerificationForm from '../ui/PortalVerificationForm';
import RegisterForm from '../ui/RegisterForm';
import TermsAgreementStep from '../ui/TermsAgreementStep';
import LoginForm from './LoginForm';

const LoginPage = () => {
    const [view, setView] = useState<'LOGIN' | 'TERMS' | 'VERIFY' | 'REGISTER'>('LOGIN');
    const [verifiedData, setVerifiedData] = useState<{ token: string; studentId: string; name: string } | null>(null);

    const handleTermsAgreed = () => {
        setView('VERIFY');
    };

    const handleVerified = (token: string, studentId: string, name: string) => {
        setVerifiedData({ token, studentId, name });
        setView('REGISTER');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-deep-navy">
            <StarBackground />

            {/* Gradient Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                {view === 'LOGIN' && <LoginForm onRegisterClick={() => setView('TERMS')} />}
                {view === 'TERMS' && (
                    <TermsAgreementStep
                        onAgree={handleTermsAgreed}
                        onBack={() => setView('LOGIN')}
                    />
                )}
                {view === 'VERIFY' && <PortalVerificationForm onVerified={handleVerified} />}
                {view === 'REGISTER' && verifiedData && (
                    <RegisterForm
                        studentId={verifiedData.studentId}
                        verificationToken={verifiedData.token}
                        name={verifiedData.name}
                        onSuccess={() => setView('LOGIN')}
                    />
                )}

                {view !== 'LOGIN' && (
                    <button
                        onClick={() => {
                            setView('LOGIN');
                            setVerifiedData(null);
                        }}
                        className="w-full text-center mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        로그인으로 돌아가기
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
