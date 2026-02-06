import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: any) => {
    if ((req as any).userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};

// 1. Submit Application (User)
router.post('/submit', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { track, content } = req.body;

        if (!track || !content) {
            res.status(400).json({ message: 'Track and content are required' });
            return;
        }

        if (!['FRONTEND', 'BACKEND'].includes(track)) {
            res.status(400).json({ message: 'Invalid track' });
            return;
        }

        // Check if user already has an application
        const existingApplication = await prisma.application.findUnique({
            where: { userId }
        });

        if (existingApplication) {
            res.status(409).json({ message: 'Application already submitted' });
            return;
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                userId,
                track,
                content,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        studentId: true,
                        name: true,
                        major: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            application: {
                id: application.id,
                track: application.track,
                status: application.status,
                createdAt: application.createdAt
            }
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 2. Get My Application (User)
router.get('/my', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const application = await prisma.application.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        studentId: true,
                        name: true,
                        major: true
                    }
                }
            }
        });

        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }

        res.json({
            success: true,
            application: {
                id: application.id,
                track: application.track,
                content: application.content,
                status: application.status,
                createdAt: application.createdAt
            }
        });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 3. Get All Applications (Admin)
router.get('/all', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const applications = await prisma.application.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        studentId: true,
                        name: true,
                        major: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            applications: applications.map((app: any) => ({
                id: app.id,
                track: app.track,
                content: app.content,
                status: app.status,
                createdAt: app.createdAt,
                user: app.user
            }))
        });
    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 4. Approve/Reject Application (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const applicationId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        const { status } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { user: true }
        });

        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }

        // Update application status
        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        studentId: true,
                        name: true,
                        major: true
                    }
                }
            }
        });

        // If approved, update user role to BABY_LION
        if (status === 'APPROVED') {
            await prisma.user.update({
                where: { id: application.userId },
                data: { role: 'BABY_LION' }
            });
        }

        res.json({
            success: true,
            application: {
                id: updatedApplication.id,
                track: updatedApplication.track,
                status: updatedApplication.status,
                user: updatedApplication.user
            }
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

