import { Router, Request, Response } from 'express';
import { verifyPortalCredentials } from '../utils/portalScraperPython';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Types extension for Request (optional, or just use 'any' for speed)

// 1. Verify Portal (Pre-registration check)
router.post('/verify', async (req: Request, res: Response) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:16', message: '/verify endpoint called', data: { hasStudentId: !!req.body.studentId, hasPortalPassword: !!req.body.portalPassword }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    try {
        const { studentId, portalPassword } = req.body;

        if (!studentId || !portalPassword) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:20', message: 'Missing credentials', data: { studentId: !!studentId, portalPassword: !!portalPassword }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
            // #endregion
            res.status(400).json({ message: 'Missing credentials' });
            return;
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:25', message: 'Calling verifyPortalCredentials', data: { studentId: studentId?.substring(0, 3) + '***' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion
        const portalData = await verifyPortalCredentials(studentId, portalPassword);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:26', message: 'verifyPortalCredentials returned', data: { verified: portalData.verified, hasName: !!portalData.name, hasMajor: !!portalData.major }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion

        if (portalData.verified) {
            // Embed name and major in the token to prevent tampering on client side
            const verificationToken = jwt.sign({
                studentId,
                verified: true,
                name: portalData.name,
                major: portalData.major
            }, JWT_SECRET, { expiresIn: '10m' });

            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:42', message: 'Verification successful, sending response', data: { hasToken: !!verificationToken }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
            res.json({
                success: true,
                verificationToken,
                name: portalData.name, // Send to client for auto-fill display
                major: portalData.major
            });
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:43', message: 'Verification failed, sending 401', data: { verified: portalData.verified }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
            res.status(401).json({ success: false, message: 'Invalid portal credentials' });
        }
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:45', message: 'Exception caught in /verify', data: { error: error instanceof Error ? error.message : String(error), errorName: error instanceof Error ? error.name : 'unknown' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        console.error('Verify error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// 2. Register (Create account with custom password)
router.post('/register', async (req: Request, res: Response) => {
    const { studentId, customPassword, verificationToken, name } = req.body;

    if (!studentId || !customPassword || !verificationToken) {
        res.status(400).json({ message: 'Missing fields' });
        return;
    }

    // Verify the token
    let tokenData: any;
    try {
        const decoded: any = jwt.verify(verificationToken, JWT_SECRET);
        if (decoded.studentId !== studentId || !decoded.verified) {
            res.status(403).json({ message: 'Invalid verification token' });
            return;
        }
        tokenData = decoded;
    } catch (e) {
        res.status(403).json({ message: 'Token expired or invalid' });
        return;
    }

    // Check if user already exists
    try {
        const existingUser = await prisma.user.findUnique({ where: { studentId } });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(customPassword, 10);

    // Create User
    // Use name from token (Portal) if available, otherwise use provided name or default
    const finalName = tokenData.name || name || 'Baby Lion';
    const finalMajor = tokenData.major || null;

    try {
        const user = await prisma.user.create({
            data: {
                studentId,
                password: hashedPassword,
                name: finalName,
                major: finalMajor,
                role: 'GUEST' // Default role - 승인 후 BABY_LION으로 변경
            }
        });

        res.status(201).json({ success: true, userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 3. Login (Site Login)
router.post('/login', async (req: Request, res: Response) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:135', message: '/login endpoint called', data: { hasStudentId: !!req.body.studentId, hasPassword: !!req.body.password }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
    // #endregion
    try {
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:139', message: 'Missing credentials in /login', data: { studentId: !!studentId, password: !!password }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
            // #endregion
            res.status(400).json({ message: 'Missing credentials' });
            return;
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:144', message: 'Querying user from database', data: { studentId: studentId?.substring(0, 3) + '***' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        const user = await prisma.user.findUnique({ where: { studentId } });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:145', message: 'User query result', data: { found: !!user, hasUser: !!user }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        if (!user) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:146', message: 'User not found, sending 401', data: { studentId: studentId?.substring(0, 3) + '***' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
            // #endregion
            res.status(401).json({ message: '등록되지 않은 사용자입니다.' });
            return;
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:150', message: 'Comparing password', data: { hasUserPassword: !!user.password }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'I' }) }).catch(() => { });
        // #endregion
        const isMatch = await bcrypt.compare(password, user.password);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:151', message: 'Password comparison result', data: { isMatch }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'I' }) }).catch(() => { });
        // #endregion
        if (!isMatch) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:152', message: 'Password mismatch, sending 401', data: { isMatch }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
            // #endregion
            res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
            return;
        }

        // Generate Session Token
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:156', message: 'Generating JWT token', data: { userId: user.id, role: user.role, hasJwtSecret: !!JWT_SECRET }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'J' }) }).catch(() => { });
        // #endregion
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:157', message: 'JWT token generated, sending response', data: { hasToken: !!token, tokenLength: token.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'J' }) }).catch(() => { });
        // #endregion

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                studentId: user.studentId,
                name: user.name,
                role: user.role,
                major: user.major
            }
        });
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.routes.ts:175', message: 'Exception caught in /login', data: { error: error instanceof Error ? error.message : String(error), errorName: error instanceof Error ? error.name : 'unknown', errorStack: error instanceof Error ? error.stack?.substring(0, 300) : 'no stack' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 4. Me (Session Check)
router.get('/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                studentId: user.studentId,
                name: user.name,
                role: user.role,
                major: user.major,
                profileImage: user.profileImage,
                bio: user.bio,
                team: user.team,
                track: user.track
            }
        });
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;
