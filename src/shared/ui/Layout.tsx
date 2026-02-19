import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SOCIAL_LINKS } from '../constants/socialLinks';
import logoWhite from '../../assets/images/logo_white.png';
import { Menu, X, ChevronRight, LogOut, User, LayoutDashboard, CalendarCheck, FileText, Rocket, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Layout = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // 페이지 이동 시 메뉴 닫기
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // 모바일 메뉴 아이템 그룹화
    const menuGroups = [
        {
            title: '소개',
            items: [
                { label: '동아리 소개', path: '/about', icon: <Rocket size={18} /> },
                { label: '프로젝트', path: '/project', icon: <LayoutDashboard size={18} /> },
            ]
        },
        {
            title: '활동',
            items: [
                { label: '지원하기', path: '/application', icon: <Send size={18} /> },
                { label: '결과 조회', path: '/result', icon: <FileText size={18} /> },
                // 로그인한 경우에만 표시
                ...(isAuthenticated && (user?.role === 'BABY_LION' || user?.role === 'ADMIN') ? [
                    { label: '출석체크', path: '/attendance', icon: <CalendarCheck size={18} /> }
                ] : [])
            ]
        },
        // 로그인한 경우에만 마이페이지 그룹 표시
        ...(isAuthenticated ? [{
            title: '마이페이지',
            items: [
                { label: '내 프로필', path: '/profile', icon: <User size={18} /> },
                ...(user?.role === 'ADMIN' ? [
                    { label: '관리자 페이지', path: '/admin', icon: <LayoutDashboard size={18} /> }
                ] : [])
            ]
        }] : [])
    ];

    return (
        <div className="min-h-screen text-starlight-white font-sans relative selection:bg-comet-blue selection:text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12 bg-deep-navy/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <Link to="/" className="flex items-center gap-2.5 z-50">
                    <img src={logoWhite} alt="LIKELION" className="h-7 w-auto" />
                    <span className="font-bold text-lg tracking-tight text-white">LIKELION USW</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8 text-sm font-medium text-white/70 items-center">
                    <Link to="/about" className="hover:text-white transition-colors">동아리 소개</Link>
                    <Link to="/project" className="hover:text-white transition-colors">프로젝트</Link>
                    <Link to="/application" className="hover:text-white transition-colors">지원하기</Link>
                    <Link to="/result" className="hover:text-white transition-colors">결과 조회</Link>

                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                            {(user.role === 'BABY_LION' || user.role === 'ADMIN') && (
                                <Link to="/attendance" className="hover:text-white transition-colors">출석체크</Link>
                            )}
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" className="hover:text-white transition-colors text-purple-400">관리자</Link>
                            )}
                            <Link to="/profile" className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-full transition-all">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">🦁</div>
                                )}
                                <span className="text-white/90">{user.name}</span>
                            </Link>
                            <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors" title="로그아웃">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="ml-4 pl-4 border-l border-white/10">
                            <Link to="/login" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-semibold">
                                로그인
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden z-50 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-deep-navy border-l border-white/10 z-40 md:hidden overflow-y-auto pt-20 pb-10 px-6 shadow-2xl"
                        >
                            {/* User Profile / Login Section */}
                            <div className="mb-8">
                                {isAuthenticated && user ? (
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-comet-blue to-purple-600 p-[2px]">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover border-2 border-deep-navy" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-deep-navy flex items-center justify-center text-xl">🦁</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg">{user.name}</div>
                                                <div className="text-xs text-slate-400">
                                                    {user.role === 'ADMIN' ? '운영진' : user.role === 'BABY_LION' ? '아기사자' : '게스트'} · {user.track || 'Lion'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="w-full py-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-slate-400 text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <LogOut size={16} /> 로그아웃
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-comet-blue/20 to-purple-600/20 rounded-2xl p-6 border border-white/10 text-center">
                                        <p className="text-slate-300 text-sm mb-4">멋쟁이사자처럼 14기와 함께하세요!</p>
                                        <Link
                                            to="/login"
                                            className="block w-full py-3 rounded-xl bg-white text-deep-navy font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            로그인 / 회원가입
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Menu Groups */}
                            <div className="space-y-8">
                                {menuGroups.map((group, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {group.items.map((item) => (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${location.pathname === item.path
                                                            ? 'bg-comet-blue/20 text-blue-300 border border-comet-blue/30'
                                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={location.pathname === item.path ? 'text-blue-400' : 'text-slate-500'}>
                                                            {item.icon}
                                                        </span>
                                                        <span className="font-medium">{item.label}</span>
                                                    </div>
                                                    <ChevronRight size={16} className={`text-slate-600 ${location.pathname === item.path ? 'text-blue-400' : ''}`} />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Links */}
                            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4 text-center">
                                <div className="flex justify-center gap-4 text-sm text-slate-500">
                                    <Link to="/terms" className="hover:text-white">이용약관</Link>
                                    <span>|</span>
                                    <Link to="/privacy" className="hover:text-white">개인정보처리방침</Link>
                                </div>
                                <div className="flex justify-center gap-4">
                                    {SOCIAL_LINKS.instagram && (
                                        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-pink-400 transition-colors">
                                            <span className="sr-only">Instagram</span>
                                            📸
                                        </a>
                                    )}
                                    {SOCIAL_LINKS.github && (
                                        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
                                            <span className="sr-only">GitHub</span>
                                            💻
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="relative pt-16 min-h-screen">
                <Outlet />
            </main>

            <footer className="py-10 text-center text-slate-500 text-xs relative z-10 border-t border-white/5 bg-deep-navy/95">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="hidden md:flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-4">
                        <Link to="/terms" className="hover:text-white transition-colors">이용약관</Link>
                        <span className="text-slate-600">|</span>
                        <Link to="/privacy" className="hover:text-white transition-colors">개인정보 처리방침</Link>
                        <span className="text-slate-600">|</span>
                        <div className="flex items-center gap-4">
                            {SOCIAL_LINKS.instagram && (
                                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                            )}
                            {SOCIAL_LINKS.github && (
                                <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                            )}
                        </div>
                    </div>
                    <p>© 2026 LIKELION SUWON UNIVERSITY. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
