import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// In-memory rate limiting
const postCooldown = new Map<string, number>();
const likeLedger = new Map<string, Set<number>>();
const COOLDOWN_MS = 30_000;

function hashIp(ip: string): string {
  const salt = process.env.JWT_SECRET || 'retro1999';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return (req.ip as string) || '0.0.0.0';
}

// GET / - 방명록 목록
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      prisma.guestbook.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, nickname: true, content: true, likes: true, createdAt: true },
      }),
      prisma.guestbook.count(),
    ]);

    res.json({ entries, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Guestbook list error:', error);
    res.status(500).json({ error: '방명록을 불러오는데 실패했습니다.' });
  }
});

// POST / - 방명록 작성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nickname, content } = req.body;

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 1 || nickname.trim().length > 20) {
      res.status(400).json({ error: '닉네임은 1~20자로 입력해주세요.' });
      return;
    }
    if (!content || typeof content !== 'string' || content.trim().length < 1 || content.trim().length > 200) {
      res.status(400).json({ error: '내용은 1~200자로 입력해주세요.' });
      return;
    }

    const ipHash = hashIp(getClientIp(req));

    // Rate limit check
    const lastPost = postCooldown.get(ipHash);
    if (lastPost && Date.now() - lastPost < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - lastPost)) / 1000);
      res.status(429).json({ error: `${remaining}초 후에 다시 작성할 수 있습니다.` });
      return;
    }

    const entry = await prisma.guestbook.create({
      data: {
        nickname: nickname.trim(),
        content: content.trim(),
        ipHash,
      },
      select: { id: true, nickname: true, content: true, likes: true, createdAt: true },
    });

    postCooldown.set(ipHash, Date.now());
    res.status(201).json(entry);
  } catch (error) {
    console.error('Guestbook create error:', error);
    res.status(500).json({ error: '방명록 작성에 실패했습니다.' });
  }
});

// POST /:id/like - 좋아요
router.post('/:id/like', async (req: Request, res: Response) => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: '잘못된 요청입니다.' });
      return;
    }

    const ipHash = hashIp(getClientIp(req));

    // Check if already liked
    if (!likeLedger.has(ipHash)) {
      likeLedger.set(ipHash, new Set());
    }
    const liked = likeLedger.get(ipHash)!;
    if (liked.has(id)) {
      res.status(409).json({ error: '이미 투표하셨습니다.' });
      return;
    }

    const entry = await prisma.guestbook.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { id: true, nickname: true, content: true, likes: true, createdAt: true },
    });

    liked.add(id);
    res.json(entry);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: '존재하지 않는 글입니다.' });
      return;
    }
    console.error('Guestbook like error:', error);
    res.status(500).json({ error: '투표에 실패했습니다.' });
  }
});

export default router;
