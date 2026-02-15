import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import applicationRoutes from './application/application.routes';
import attendanceRoutes from './attendance/attendance.routes';
import memberRoutes from './member/member.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS 설정
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://www.usw-likelion.kr',
    'https://usw-likelion.kr',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // origin이 없는 경우 (같은 도메인에서 요청, nginx 프록시 등) 허용
        if (!origin) {
            callback(null, true);
            return;
        }

        // 개발 환경에서는 모든 origin 허용
        if (process.env.NODE_ENV === 'development') {
            callback(null, true);
            return;
        }

        // 허용된 origin 목록에 있는지 확인
        if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin && origin.includes(allowed))) {
            callback(null, true);
            return;
        }

        // Cloud Run URL 패턴 허용 (*.run.app) - NODE_ENV와 관계없이 항상 허용
        if (origin.includes('.run.app')) {
            callback(null, true);
            return;
        }

        // usw-likelion.kr 도메인 패턴 허용
        if (origin.includes('usw-likelion.kr')) {
            callback(null, true);
            return;
        }

        // 모든 조건을 통과하지 못한 경우 차단
        console.warn(`CORS blocked origin: ${origin}`);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app.ts:48', message: 'CORS blocked', data: { origin, allowedOrigins, nodeEnv: process.env.NODE_ENV }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'N' }) }).catch(() => { });
        // #endregion
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// 전역 에러 핸들러 추가
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app.ts:42', message: 'Unhandled error caught', data: { error: err.message, errorName: err.name, stack: err.stack?.substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'M' }) }).catch(() => { });
    // #endregion
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/members', memberRoutes);

// SSE Log Stream
import { logger } from './utils/logger';

app.get('/api/logs', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send successful connection comment
    res.write(': connected\n\n');

    // Send recent logs first
    logger.getRecentLogs().forEach(log => {
        res.write(`data: ${JSON.stringify({ message: log })}\n\n`);
    });

    // Listener for new logs
    const onLog = (message: string) => {
        res.write(`data: ${JSON.stringify({ message })}\n\n`);
    };

    logger.on('log', onLog);

    // Clean up on close
    req.on('close', () => {
        logger.off('log', onLog);
    });
});

app.get('/', (req, res) => {
    res.send('Likelion USW API is running');
});

// Prisma Client 초기화 테스트 (서버 시작 시)
import { PrismaClient } from '@prisma/client';
const testPrisma = new PrismaClient();
testPrisma.$connect().then(() => {
    console.log('Prisma Client initialized successfully');
    testPrisma.$disconnect();
}).catch((err) => {
    console.error('Prisma Client initialization failed:', err);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app.ts:82', message: 'Prisma Client init failed', data: { error: err.message, errorName: err.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'L' }) }).catch(() => { });
    // #endregion
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app.ts:90', message: 'Server started successfully', data: { port: PORT, nodeEnv: process.env.NODE_ENV }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'K' }) }).catch(() => { });
    // #endregion
});
