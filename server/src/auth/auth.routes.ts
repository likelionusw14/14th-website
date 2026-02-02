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
    try {
        const { studentId, portalPassword } = req.body;

        if (!studentId || !portalPassword) {
            res.status(400).json({ message: 'Missing credentials' });
            return;
        }

        const portalData = await verifyPortalCredentials(studentId, portalPassword);

        if (portalData.verified) {
            // Embed name and major in the token to prevent tampering on client side
            const verificationToken = jwt.sign({
                studentId,
                verified: true,
                name: portalData.name,
                major: portalData.major
            }, JWT_SECRET, { expiresIn: '10m' });

            res.json({
                success: true,
                verificationToken,
                name: portalData.name, // Send to client for auto-fill display
                major: portalData.major
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid portal credentials' });
        }
    } catch (error) {
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
    try {
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            res.status(400).json({ message: 'Missing credentials' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { studentId } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate Session Token
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

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
                major: user.major
            }
        });
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;
