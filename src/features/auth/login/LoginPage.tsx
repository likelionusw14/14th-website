import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StarBackground from '../../../shared/ui/StarBackground';
import PortalVerificationForm from '../ui/PortalVerificationForm';
import RegisterForm from '../ui/RegisterForm';
import ActivateForm from '../ui/ActivateForm';
import TermsAgreementStep from '../ui/TermsAgreementStep';
import LoginForm from './LoginForm';

const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const [view, setView] = useState<'LOGIN' | 'TERMS' | 'VERIFY' | 'REGISTER' | 'ACTIVATE_VERIFY' | 'ACTIVATE_REGISTER'>('LOGIN');
    const [verifiedData, setVerifiedData] = useState<{ token: string; studentId: string; name: string } | null>(null);
    const [activationInfo, setActivationInfo] = useState<{ name: string; phoneLastDigits: string } | null>(null);

    useEffect(() => {
        if (searchParams.get('mode') === 'activate') {
            const name = searchParams.get('name') || '';
            const phoneLastDigits = searchParams.get('phoneLastDigits') || '';
            if (name && phoneLastDigits) {
                setActivationInfo({ name, phoneLastDigits });
                setView('ACTIVATE_VERIFY');
            }
        }
    }, [searchParams]);

    const handleTermsAgreed = () => {
        setView('VERIFY');
    };

    const handleVerified = (token: string, studentId: string, name: string) => {
        setVerifiedData({ token, studentId, name });
        setView('REGISTER');
    };

    const handleActivateVerified = (token: string, studentId: string, name: string) => {
        setVerifiedData({ token, studentId, name });
        setView('ACTIVATE_REGISTER');
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
                {view === 'ACTIVATE_VERIFY' && (
                    <div>
                        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <h3 className="text-green-400 font-semibold text-sm mb-1">최종합격자 계정 등록</h3>
                            <p className="text-slate-400 text-xs">포털 인증을 통해 학번과 비밀번호를 등록합니다.</p>
                        </div>
                        <PortalVerificationForm onVerified={handleActivateVerified} />
                    </div>
                )}
                {view === 'ACTIVATE_REGISTER' && verifiedData && activationInfo && (
                    <ActivateForm
                        studentId={verifiedData.studentId}
                        verificationToken={verifiedData.token}
                        portalName={verifiedData.name}
                        activationName={activationInfo.name}
                        phoneLastDigits={activationInfo.phoneLastDigits}
                        onSuccess={() => setView('LOGIN')}
                    />
                )}

                {view !== 'LOGIN' && (
                    <button
                        onClick={() => {
                            setView('LOGIN');
                            setVerifiedData(null);
                            setActivationInfo(null);
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
