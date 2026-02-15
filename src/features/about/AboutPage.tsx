import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';
import { API_BASE_URL } from '../../shared/context/AuthContext';

interface Member {
    id: number;
    name: string | null;
    role: string;
    profileImage: string | null;
    bio: string | null;
    team: string | null;
    track: string | null;
    major: string | null;
}

const TEAMS = ['대표', '운영팀', '교육팀', '홍보팀'] as const;
const TRACKS = [
    { key: 'FRONTEND', label: '프론트엔드', emoji: '🪐', color: 'purple' },
    { key: 'BACKEND', label: '백엔드', emoji: '🛰️', color: 'blue' },
    { key: 'DESIGN', label: '디자인', emoji: '🎨', color: 'pink' },
    { key: 'PM', label: '기획', emoji: '🚀', color: 'yellow' },
] as const;

const SCHEDULE = [
    { date: "3월", title: "OT & 오리엔테이션", desc: "새로운 아기사자들이 합류하고, 1년간의 여정을 안내합니다.", icon: "🎉" },
    { date: "4월 - 6월", title: "1학기 트랙별 세션", desc: "프론트엔드·백엔드·디자인·기획 트랙별 집중 교육을 진행합니다.", icon: "📚" },
    { date: "5월", title: "중앙 아이디어톤", desc: "전국 아기사자들이 한자리에 모여 창의적인 아이디어를 공유합니다.", icon: "💡" },
    { date: "7월 - 8월", title: "중앙 해커톤", desc: "전국 54개 대학 1,600명이 참여하는 국내 최대 대학 해커톤에서 아이디어를 실현합니다.", icon: "🔥" },
    { date: "9월 - 11월", title: "2학기 트랙별 세션", desc: "심화 학습과 팀 프로젝트를 통해 실전 역량을 키웁니다.", icon: "⚡" },
    { date: "12월", title: "종강총회 & 데모데이", desc: "1년간의 성과를 공유하고 최우수 프로젝트를 시상합니다.", icon: "🏆" }
];

const STATS = [
    { number: "121+", label: "참여 대학", desc: "전국 대학이 함께합니다" },
    { number: "4,000+", label: "활동 멤버", desc: "매년 새로운 사자들이 합류합니다" },
    { number: "13기", label: "운영 기수", desc: "2013년부터 이어온 역사" },
    { number: "1,600+", label: "해커톤 참가자", desc: "국내 최대 대학 해커톤" },
];

const BENEFITS = [
    {
        icon: "🎓",
        title: "체계적 코딩 교육",
        desc: "비전공자도 OK! 웹 개발의 기초부터 심화까지 트랙별 맞춤 커리큘럼으로 배웁니다."
    },
    {
        icon: "🤝",
        title: "팀 프로젝트 경험",
        desc: "기획자, 디자이너, 개발자가 한 팀이 되어 실제 서비스를 만들어봅니다."
    },
    {
        icon: "🏅",
        title: "전국 규모 행사",
        desc: "아이디어톤, 해커톤 등 전국 단위 행사에서 다른 대학 사자들과 경쟁하고 교류합니다."
    },
    {
        icon: "💼",
        title: "취업 & 창업 네트워크",
        desc: "잡코리아 MOU 채용 연계, IT 기업 멘토링, 창업 지원 등 실질적 커리어 혜택을 제공합니다."
    },
    {
        icon: "🌏",
        title: "글로벌 커뮤니티",
        desc: "미국(LIKELION US), 베트남 등 해외에서도 활동하는 글로벌 IT 커뮤니티입니다."
    },
    {
        icon: "🦁",
        title: "평생 네트워크",
        desc: "수료 후에도 이어지는 멋사 동문 네트워크로 IT 업계 인맥을 쌓을 수 있습니다."
    },
];

const AboutPage = () => {
    const [admins, setAdmins] = useState<Member[]>([]);
    const [babyLions, setBabyLions] = useState<Member[]>([]);
    const [activeTeamTab, setActiveTeamTab] = useState<string>('전체');
    const [activeTrackTab, setActiveTrackTab] = useState<string>('전체');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/members`);
            const result = await response.json();
            if (result.success) {
                setAdmins(result.admins);
                setBabyLions(result.babyLions);
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTrackLabel = (track: string | null) => {
        return TRACKS.find(t => t.key === track)?.label || track || '미정';
    };

    const filteredAdmins = activeTeamTab === '전체' ? admins : admins.filter(a => a.team === activeTeamTab);
    const filteredBabyLions = activeTrackTab === '전체' ? babyLions : babyLions.filter(b => b.track === activeTrackTab);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-deep-navy">
            <StarBackground />

            {/* ───────────────────────────────────────────── */}
            {/* Hero Section */}
            {/* ───────────────────────────────────────────── */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 z-10 pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent rounded-full blur-[120px] pointer-events-none"
                />

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400 mb-6"
                >
                    🦁 국내 최대 IT 창업 동아리
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight"
                >
                    <span className="text-gradient-lion">멋쟁이사자처럼</span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
                        수원대학교 14기
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8"
                >
                    "내 아이디어를 내 손으로 실현한다"
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="text-sm md:text-base text-slate-400 max-w-3xl leading-relaxed"
                >
                    멋쟁이사자처럼은 2013년 서울대학교에서 시작하여,
                    현재 전국 121개 대학, 4,000명 이상의 대학생이 참여하는<br className="hidden md:block" />
                    <strong className="text-white/80">국내 최대 규모의 IT 창업 동아리</strong>입니다.
                    기술을 통한 아이디어 실현을 목표로,<br className="hidden md:block" />
                    비전공자도 함께하는 열린 커뮤니티를 운영하고 있습니다.
                </motion.p>
            </section>

            {/* ───────────────────────────────────────────── */}
            {/* Stats Section */}
            {/* ───────────────────────────────────────────── */}
            <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {STATS.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center p-6 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all"
                        >
                            <div className="text-3xl md:text-4xl font-extrabold text-gradient-lion mb-1">{stat.number}</div>
                            <div className="text-white font-semibold text-sm md:text-base">{stat.label}</div>
                            <div className="text-slate-500 text-xs mt-1">{stat.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────────────────────────────────────────── */}
            {/* What is LikeLion */}
            {/* ───────────────────────────────────────────── */}
            <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">멋쟁이사자처럼이란?</h2>
                    <p className="text-slate-400">테크 기반 아이디어 실현을 위한 전국 대학 연합 IT 동아리</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="p-6 rounded-2xl glass border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">🌱</span> 시작
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                2013년, <strong className="text-white">"누구나 코딩을 배울 수 있다"</strong>는 비전으로
                                서울대학교에서 시작되었습니다. 이두희 창업자의 철학 아래,
                                비전공자도 기술을 배워 자신의 아이디어를 직접 구현할 수 있는
                                환경을 만들었습니다.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl glass border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">🎯</span> 미션
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                <strong className="text-white">기술 교육 → 팀 프로젝트 → 서비스 런칭</strong>의
                                과정을 통해 대학생이 아이디어를 실제 서비스로 만들어내는 경험을 제공합니다.
                                기획자, 디자이너, 개발자가 한 팀이 되어 협업하며 성장합니다.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="p-6 rounded-2xl glass border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">🌍</span> 규모
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                현재 <strong className="text-white">전국 121개 대학</strong>에서
                                매 기수 <strong className="text-white">4,000명 이상</strong>의 대학생이 활동 중입니다.
                                미국(LIKELION US), 베트남 등 해외까지 확장되어
                                글로벌 IT 커뮤니티로 성장했습니다.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl glass border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">🔗</span> 네트워크
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                잡코리아 MOU 채용 연계, K-디지털 트레이닝 부트캠프, AI 무료 강의 등
                                <strong className="text-white"> 실질적인 취업·창업 기회</strong>를 제공합니다.
                                수료 후에도 동문 네트워크를 통해 IT 업계로의 진입을 지원합니다.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ───────────────────────────────────────────── */}
            {/* Benefits Section */}
            {/* ───────────────────────────────────────────── */}
            <section className="py-20 px-6 max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">함께하면 얻을 수 있는 것</h2>
                    <p className="text-slate-400">멋쟁이사자처럼 활동을 통해 성장하세요</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {BENEFITS.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -5 }}
                            className="p-6 rounded-2xl glass border border-white/10 hover:border-comet-blue/30 transition-all group"
                        >
                            <div className="text-3xl mb-3">{benefit.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-comet-blue transition-colors">{benefit.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────────────────────────────────────────── */}
            {/* Tracks Section */}
            {/* ───────────────────────────────────────────── */}
            <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">트랙 소개</h2>
                    <p className="text-slate-400">4개 트랙에서 자신의 역할을 찾아보세요</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        {
                            name: 'Frontend', emoji: '🪐', color: 'purple',
                            desc: '사용자가 직접 보고 만지는 화면을 만듭니다.',
                            techs: ['React', 'TypeScript', 'CSS', 'Responsive Design'],
                            detail: 'HTML/CSS 기초부터 React 프레임워크까지 단계적으로 학습합니다. UI/UX를 고려한 아름다운 인터페이스를 구현하는 능력을 기릅니다.'
                        },
                        {
                            name: 'Backend', emoji: '🛰️', color: 'blue',
                            desc: '서비스의 핵심 로직과 데이터를 설계합니다.',
                            techs: ['Spring Boot', 'Django', 'REST API', 'Database'],
                            detail: '서버 아키텍처, 데이터베이스 설계, API 개발을 배웁니다. 안정적이고 확장 가능한 백엔드 시스템을 구축하는 역량을 키웁니다.'
                        },
                        {
                            name: 'Design', emoji: '🎨', color: 'pink',
                            desc: '사용자 중심의 경험을 디자인합니다.',
                            techs: ['Figma', 'UX Research', 'Prototyping', 'Design System'],
                            detail: 'UX 리서치부터 프로토타이핑까지, 실제 서비스에 적용되는 디자인을 경험합니다. 개발자와 협업하는 디자인 프로세스를 배웁니다.'
                        },
                        {
                            name: 'PM (기획)', emoji: '🚀', color: 'yellow',
                            desc: '아이디어를 서비스로 기획하고 프로젝트를 이끕니다.',
                            techs: ['Service Planning', 'User Story', 'Agile', 'Data Analysis'],
                            detail: '시장 분석, 사용자 조사, 서비스 기획, 프로젝트 매니지먼트를 배웁니다. 팀의 비전을 설정하고 목표 달성을 이끄는 리더십을 기릅니다.'
                        },
                    ].map((track, index) => (
                        <motion.div
                            key={track.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className={`group relative p-8 rounded-3xl glass overflow-hidden border border-white/10 hover:border-${track.color}-500/50 transition-all`}
                        >
                            <div className={`absolute top-0 right-0 w-40 h-40 bg-${track.color}-500/15 rounded-full blur-[50px] group-hover:bg-${track.color}-500/30 transition-all`} />
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">{track.emoji}</span>
                                    <h3 className={`text-2xl font-bold text-white group-hover:text-${track.color}-300 transition-colors`}>{track.name}</h3>
                                </div>
                                <p className="text-slate-300 mb-4">{track.desc}</p>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">{track.detail}</p>
                                <div className="flex flex-wrap gap-2">
                                    {track.techs.map(tech => (
                                        <span key={tech} className={`px-3 py-1 rounded-full text-xs font-medium bg-${track.color}-500/10 text-${track.color}-300 border border-${track.color}-500/20`}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────────────────────────────────────────── */}
            {/* Annual Schedule Timeline */}
            {/* ───────────────────────────────────────────── */}
            <section className="py-24 px-6 relative z-10 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">연간 일정</h2>
                    <p className="text-slate-400">1년 동안 이어지는 성장의 여정을 소개합니다</p>
                </motion.div>

                <div className="relative border-l-2 border-white/10 ml-4 md:ml-0 md:pl-0 space-y-12">
                    {SCHEDULE.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-8 md:pl-0 md:flex md:items-center md:justify-between group"
                        >
                            <div className="absolute left-[-5px] top-2 w-3 h-3 bg-comet-blue rounded-full shadow-[0_0_10px_#3b82f6] md:left-auto md:right-auto md:relative md:w-4 md:h-4 md:order-2 md:mx-8 md:ring-4 md:ring-deep-navy" />
                            <div className={`md:w-[45%] ${index % 2 === 0 ? 'md:order-1 md:text-right' : 'md:order-3 md:text-left'} p-6 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all`}>
                                <span className="text-sm font-bold text-comet-blue block mb-1">{item.date}</span>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {item.icon} {item.title}
                                </h3>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                            <div className={`hidden md:block md:w-[45%] ${index % 2 === 0 ? 'md:order-3' : 'md:order-1'}`} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ───────────────────────────────────────────── */}
            {/* Staff Section */}
            {/* ───────────────────────────────────────────── */}
            <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">운영진</h2>
                    <p className="text-slate-400">14기를 이끌어가는 운영진을 소개합니다</p>
                </motion.div>

                <div className="flex justify-center gap-3 mb-10 flex-wrap">
                    {['전체', ...TEAMS].map((team) => (
                        <button
                            key={team}
                            onClick={() => setActiveTeamTab(team)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTeamTab === team
                                ? 'bg-comet-blue text-white shadow-lg shadow-comet-blue/30'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {team}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="text-slate-400 text-center py-12">로딩 중...</div>
                ) : filteredAdmins.length === 0 ? (
                    <div className="text-slate-400 text-center py-12">등록된 운영진이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAdmins.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative p-6 rounded-2xl glass border border-white/10 hover:border-purple-500/30 transition-all text-center"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-white/10 group-hover:border-purple-500/40 transition-all">
                                    {member.profileImage ? (
                                        <img src={member.profileImage} alt={member.name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-white text-lg">{member.name || '이름 미등록'}</h3>
                                {member.team && (
                                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                                        {member.team}
                                    </span>
                                )}
                                {member.bio && (
                                    <p className="text-slate-400 text-sm mt-3 leading-relaxed">{member.bio}</p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* ───────────────────────────────────────────── */}
            {/* Baby Lions Section */}
            {/* ───────────────────────────────────────────── */}
            <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">아기사자</h2>
                    <p className="text-slate-400">14기 아기사자들을 소개합니다</p>
                </motion.div>

                <div className="flex justify-center gap-3 mb-10 flex-wrap">
                    <button
                        onClick={() => setActiveTrackTab('전체')}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTrackTab === '전체'
                            ? 'bg-comet-blue text-white shadow-lg shadow-comet-blue/30'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        전체
                    </button>
                    {TRACKS.map((track) => (
                        <button
                            key={track.key}
                            onClick={() => setActiveTrackTab(track.key)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTrackTab === track.key
                                ? 'bg-comet-blue text-white shadow-lg shadow-comet-blue/30'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {track.emoji} {track.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="text-slate-400 text-center py-12">로딩 중...</div>
                ) : filteredBabyLions.length === 0 ? (
                    <div className="text-slate-400 text-center py-12">등록된 아기사자가 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {filteredBabyLions.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.03 }}
                                className="group relative p-5 rounded-2xl glass border border-white/10 hover:border-blue-500/30 transition-all text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-2 border-white/10">
                                    {member.profileImage ? (
                                        <img src={member.profileImage} alt={member.name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">🦁</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-white">{member.name || '이름 미등록'}</h3>
                                <span className="text-xs text-slate-400">{getTrackLabel(member.track)}</span>
                                {member.bio && (
                                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">{member.bio}</p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AboutPage;
