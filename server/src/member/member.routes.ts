import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// GCS setup
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'likelion-usw-profiles';
const bucket = storage.bucket(bucketName);

// Multer - memory storage (upload to GCS, not local disk)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다 (jpg, png, webp, gif)'));
        }
    }
});

// Auth middleware
const authenticate = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ success: false, message: '인증이 필요합니다' });
        return;
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch (e) {
        res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다' });
    }
};

// GET /api/members - 공개 API: 운영진 + 아기사자 목록
router.get('/', async (_req: Request, res: Response) => {
    try {
        const members = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'BABY_LION'] }
            },
            select: {
                id: true,
                name: true,
                role: true,
                profileImage: true,
                bio: true,
                team: true,
                track: true,
                major: true,
            },
            orderBy: { createdAt: 'asc' }
        });

        const admins = members.filter(m => m.role === 'ADMIN');
        const babyLions = members.filter(m => m.role === 'BABY_LION');

        res.json({
            success: true,
            admins,
            babyLions
        });
    } catch (error) {
        console.error('Failed to fetch members:', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// PATCH /api/members/profile - 프로필 수정 (인증 필요)
router.patch('/profile', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { bio, team, track } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다' });
            return;
        }

        const updateData: any = {};
        if (bio !== undefined) updateData.bio = bio;

        // ADMIN만 team 변경 가능
        if (user.role === 'ADMIN' && team !== undefined) {
            updateData.team = team;
        }

        // BABY_LION의 track은 읽기전용이므로 여기서 변경하지 않음
        // ADMIN이 본인 track도 설정할 수 있도록
        if (track !== undefined) {
            updateData.track = track;
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                role: true,
                profileImage: true,
                bio: true,
                team: true,
                track: true,
                major: true,
            }
        });

        res.json({ success: true, user: updated });
    } catch (error) {
        console.error('Failed to update profile:', error);
        res.status(500).json({ success: false, message: '프로필 수정 실패' });
    }
});

// POST /api/members/profile/upload - 프로필 이미지 업로드 (인증 필요)
router.post('/profile/upload', authenticate, upload.single('profileImage'), async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const file = req.file;

        if (!file) {
            res.status(400).json({ success: false, message: '이미지 파일이 필요합니다' });
            return;
        }

        // Generate unique filename
        const ext = path.extname(file.originalname) || '.jpg';
        const fileName = `profiles/${userId}_${Date.now()}${ext}`;

        // Upload to GCS
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            }
        });

        await new Promise<void>((resolve, reject) => {
            blobStream.on('error', reject);
            blobStream.on('finish', resolve);
            blobStream.end(file.buffer);
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        // Update user profile image URL
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { profileImage: publicUrl },
            select: {
                id: true,
                profileImage: true,
            }
        });

        res.json({ success: true, profileImage: updated.profileImage });
    } catch (error) {
        console.error('Failed to upload profile image:', error);
        res.status(500).json({ success: false, message: '이미지 업로드 실패' });
    }
});

export default router;
