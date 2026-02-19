import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarBackground from '../../shared/ui/StarBackground';
import { useAuth, API_BASE_URL } from '../../shared/context/AuthContext';

const TEAMS = ['대표', '운영팀', '교육팀', '홍보팀'] as const;
const TRACKS = [
    { key: 'FRONTEND', label: '프론트엔드' },
    { key: 'BACKEND', label: '백엔드' },
    { key: 'DESIGN', label: '디자인' },
    { key: 'PM', label: '기획' },
] as const;

// 크롭 모달 컴포넌트
const CropModal = ({
    imageSrc,
    onCrop,
    onCancel
}: {
    imageSrc: string;
    onCrop: (blob: Blob) => void;
    onCancel: () => void;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);

    const CANVAS_SIZE = 300;
    const CROP_RADIUS = 130;

    // 이미지 로드
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageRef.current = img;
            // 이미지가 원에 딱 맞도록 초기 스케일 계산
            const minDim = Math.min(img.width, img.height);
            const initialScale = (CROP_RADIUS * 2) / minDim;
            setScale(initialScale);
            setOffset({ x: 0, y: 0 });
            setImageLoaded(true);
        };
        img.src = imageSrc;
    }, [imageSrc]);

    // 캔버스 렌더링
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // 이미지 그리기
        const imgW = img.width * scale;
        const imgH = img.height * scale;
        const imgX = CANVAS_SIZE / 2 - imgW / 2 + offset.x;
        const imgY = CANVAS_SIZE / 2 - imgH / 2 + offset.y;

        ctx.save();
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
        ctx.restore();

        // 원형 마스크 외부 어둡게
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 원형 테두리
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
    }, [scale, offset]);

    useEffect(() => {
        if (imageLoaded) drawCanvas();
    }, [imageLoaded, drawCanvas]);

    // 드래그 핸들러
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }, [isDragging, dragStart]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        setOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }, [isDragging, dragStart]);

    const handleMouseUp = () => setIsDragging(false);

    // 크롭 실행
    const handleCrop = () => {
        const img = imageRef.current;
        if (!img) return;

        const outputSize = 400; // 출력 이미지 크기
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = outputSize;
        exportCanvas.height = outputSize;
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) return;

        // 원형 클리핑
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();

        // 크롭 영역에서의 이미지 위치 계산
        const cropScale = outputSize / (CROP_RADIUS * 2);
        const imgW = img.width * scale * cropScale;
        const imgH = img.height * scale * cropScale;
        const imgX = outputSize / 2 - imgW / 2 + offset.x * cropScale;
        const imgY = outputSize / 2 - imgH / 2 + offset.y * cropScale;

        ctx.drawImage(img, imgX, imgY, imgW, imgH);

        exportCanvas.toBlob((blob) => {
            if (blob) onCrop(blob);
        }, 'image/png', 0.95);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass p-6 rounded-2xl border border-white/10 shadow-2xl max-w-sm w-full"
            >
                <h3 className="text-white font-bold text-lg mb-4">프로필 사진 편집</h3>

                {/* 크롭 영역 */}
                <div className="flex justify-center mb-4">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="rounded-lg cursor-grab active:cursor-grabbing touch-none"
                        style={{ maxWidth: '100%', background: '#111' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                    />
                </div>

                {/* 확대/축소 슬라이더 */}
                <div className="mb-5">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">🔍</span>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.01"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="flex-1 accent-comet-blue h-2 rounded-lg appearance-none bg-white/10 cursor-pointer"
                        />
                        <span className="text-slate-400 text-xs w-12 text-right">{Math.round(scale * 100)}%</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 text-center">드래그하여 위치를 조정하세요</p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-lg bg-white/5 text-slate-300 font-semibold hover:bg-white/10 transition-all border border-white/10"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleCrop}
                        className="flex-1 py-3 rounded-lg bg-gradient-to-r from-comet-blue to-nebula-purple text-white font-semibold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all"
                    >
                        적용
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProfilePage = () => {
    const { user, token, login } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [bio, setBio] = useState(user?.bio || '');
    const [team, setTeam] = useState(user?.team || '');
    const [track, setTrack] = useState(user?.track || '');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    if (!user) return null;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 파일을 읽어서 크롭 모달 열기
        const reader = new FileReader();
        reader.onload = (ev) => {
            setCropImageSrc(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        // input 초기화 (같은 파일 재선택 가능)
        e.target.value = '';
    };

    const handleCropComplete = async (blob: Blob) => {
        setCropImageSrc(null);

        // 미리보기
        const previewUrl = URL.createObjectURL(blob);
        setPreviewImage(previewUrl);

        // 업로드
        setIsUploading(true);
        setErrorMsg('');
        try {
            const formData = new FormData();
            formData.append('profileImage', blob, 'profile.png');

            const response = await fetch(`${API_BASE_URL}/api/members/profile/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('프로필 이미지가 업로드되었습니다');
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

    const handleDeleteImage = async () => {
        if (!confirm('프로필 사진을 삭제하시겠습니까?')) return;

        setIsDeleting(true);
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/members/profile/image`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setSuccessMsg('프로필 이미지가 삭제되었습니다');
                setPreviewImage(null);
                login(token!, { ...user, profileImage: null });
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg(result.message || '삭제 실패');
            }
        } catch (err) {
            setErrorMsg('이미지 삭제 중 오류가 발생했습니다');
        } finally {
            setIsDeleting(false);
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
                            <div className="flex items-center gap-3 mt-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-comet-blue hover:text-comet-blue/80 transition-colors font-medium"
                                >
                                    📷 사진 업로드
                                </button>
                                {(displayImage || user.profileImage) && (
                                    <button
                                        onClick={handleDeleteImage}
                                        disabled={isDeleting}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {isDeleting ? '삭제 중...' : '🗑️ 사진 삭제'}
                                    </button>
                                )}
                            </div>
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

            {/* 크롭 모달 */}
            <AnimatePresence>
                {cropImageSrc && (
                    <CropModal
                        imageSrc={cropImageSrc}
                        onCrop={handleCropComplete}
                        onCancel={() => setCropImageSrc(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
