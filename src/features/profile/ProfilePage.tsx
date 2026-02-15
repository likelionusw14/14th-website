import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';
import { useAuth, API_BASE_URL } from '../../shared/context/AuthContext';

const TEAMS = ['대표', '운영팀', '교육팀', '홍보팀'] as const;
const TRACKS = [
    { key: 'FRONTEND', label: '프론트엔드' },
    { key: 'BACKEND', label: '백엔드' },
    { key: 'DESIGN', label: '디자인' },
    { key: 'PM', label: '기획' },
] as const;

const ProfilePage = () => {
    const { user, token, login } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [bio, setBio] = useState(user?.bio || '');
    const [team, setTeam] = useState(user?.team || '');
    const [track, setTrack] = useState(user?.track || '');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!user) return null;

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        setIsUploading(true);
        setErrorMsg('');
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await fetch(`${API_BASE_URL}/api/members/profile/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('프로필 이미지가 업로드되었습니다');
                // Update auth context
                login(token!, { ...user, profileImage: result.profileImage });
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '업로드 실패');
                setPreviewImage(null);
            }
        } catch (err) {
            setErrorMsg('이미지 업로드 중 오류가 발생했습니다');
            setPreviewImage(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setErrorMsg('');
        try {
            const body: any = { bio };
            if (user.role === 'ADMIN') {
                body.team = team;
            }
            if (track) {
                body.track = track;
            }

            const response = await fetch(`${API_BASE_URL}/api/members/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('프로필이 저장되었습니다');
                login(token!, { ...user, bio: result.user.bio, team: result.user.team, track: result.user.track });
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '저장 실패');
            }
        } catch (err) {
            setErrorMsg('프로필 저장 중 오류가 발생했습니다');
        } finally {
            setIsSaving(false);
        }
    };

    const displayImage = previewImage || user.profileImage;

    return (
        <div className="min-h-screen p-4 relative overflow-hidden bg-deep-navy">
            <StarBackground />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <h1 className="text-3xl font-bold text-white mb-2">내 프로필</h1>
                        <p className="text-slate-400 text-sm mb-8">
                            {user.role === 'ADMIN' ? '운영진' : user.role === 'BABY_LION' ? '아기사자' : '게스트'} · {user.name} · {user.studentId}
                        </p>

                        {errorMsg && <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-sm mb-4">{errorMsg}</div>}
                        {successMsg && <div className="p-3 rounded-lg bg-green-500/20 text-green-300 text-sm mb-4">{successMsg}</div>}

                        {/* 프로필 이미지 */}
                        <div className="flex flex-col items-center mb-8">
                            <div
                                className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-3 border-white/20 cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {displayImage ? (
                                    <img src={displayImage} alt="프로필" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                        {user.role === 'ADMIN' ? '👤' : '🦁'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm font-semibold">
                                        {isUploading ? '업로드 중...' : '사진 변경'}
                                    </span>
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <p className="text-slate-500 text-xs mt-2">클릭하여 프로필 사진을 업로드하세요</p>
                        </div>

                        <div className="space-y-6">
                            {/* 운영진: 팀 선택 */}
                            {user.role === 'ADMIN' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">소속 팀</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {TEAMS.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setTeam(t)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${team === t
                                                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 파트 (아기사자는 읽기전용 표시, 운영진도 선택 가능) */}
                            {user.role === 'BABY_LION' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">파트</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {TRACKS.map((t) => (
                                            <button
                                                key={t.key}
                                                type="button"
                                                onClick={() => setTrack(t.key)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${track === t.key
                                                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 한줄소개 */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">한줄소개</label>
                                <input
                                    type="text"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength={100}
                                    placeholder="한줄소개를 입력하세요 (최대 100자)"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-comet-blue transition-colors"
                                />
                                <p className="text-xs text-slate-500 mt-1 text-right">{bio.length}/100</p>
                            </div>

                            {/* 저장 버튼 */}
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full px-6 py-3 rounded-lg bg-comet-blue text-white font-semibold hover:bg-comet-blue/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? '저장 중...' : '프로필 저장'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
