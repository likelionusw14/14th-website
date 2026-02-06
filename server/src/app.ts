import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import applicationRoutes from './application/application.routes';
import attendanceRoutes from './attendance/attendance.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS 설정
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // origin이 없는 경우 (같은 도메인에서 요청, nginx 프록시 등) 허용
        // 개발 환경에서는 모든 origin 허용
        // 프로덕션에서는 허용된 origin 목록에 있거나 origin이 없는 경우 허용
        if (!origin || 
            process.env.NODE_ENV === 'development' || 
            allowedOrigins.includes(origin) ||
            allowedOrigins.some(allowed => origin && origin.includes(allowed))) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/attendance', attendanceRoutes);

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
