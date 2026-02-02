import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SOCIAL_LINKS } from '../constants/socialLinks';

const Layout = () => {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen text-starlight-white font-sans relative selection:bg-comet-blue selection:text-white">
            <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12 glass transition-all duration-300">
                <Link to="/" className="font-bold text-xl tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">LIKELION USW</Link>
                <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300 items-center">
                    <Link to="/" className="hover:text-white transition-colors">동아리 소개</Link>
                    <Link to="/project" className="hover:text-white transition-colors">프로젝트</Link>
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-4">
                            {user.role === 'GUEST' && (
                                <Link to="/application" className="hover:text-white transition-colors">지원하기</Link>
                            )}
                            {(user.role === 'BABY_LION' || user.role === 'ADMIN') && (
                                <Link to="/attendance" className="hover:text-white transition-colors">출석체크</Link>
                            )}
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" className="hover:text-white transition-colors">관리자</Link>
                            )}
                            <span className="text-white/80">{user.name || user.studentId} ({user.major || 'Lion'})</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                                user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                                user.role === 'BABY_LION' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                            }`}>
                                {user.role === 'ADMIN' ? '운영진' : user.role === 'BABY_LION' ? '아기사자' : '게스트'}
                            </span>
                            <button onClick={logout} className="hover:text-red-400 transition-colors">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="hover:text-white transition-colors">지원하기</Link>
                    )}
                </nav>
            </header>
            <main className="relative">
                <Outlet />
            </main>
            <footer className="py-10 text-center text-slate-500 text-xs relative z-10 border-t border-white/5 bg-deep-navy/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-4">
                        <Link to="/terms" className="hover:text-white transition-colors">
                            이용약관
                        </Link>
                        <span className="hidden md:inline text-slate-600">|</span>
                        <Link to="/privacy" className="hover:text-white transition-colors">
                            개인정보 처리방침
                        </Link>
                        <span className="hidden md:inline text-slate-600">|</span>
                        <div className="flex items-center gap-4">
                            {SOCIAL_LINKS.instagram && (
                                <a
                                    href={SOCIAL_LINKS.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                    aria-label="Instagram"
                                >
                                    Instagram
                                </a>
                            )}
                            {SOCIAL_LINKS.github && (
                                <a
                                    href={SOCIAL_LINKS.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                    aria-label="GitHub"
                                >
                                    GitHub
                                </a>
                            )}
                        </div>
                    </div>
                    <p>© 2026 LIKELION SUWON UNIVERSITY. All rights reserved.</p>
                    <p className="mt-2">Designed for the Universe.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
