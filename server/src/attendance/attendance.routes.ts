import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import * as XLSX from 'xlsx';
import { google } from 'googleapis';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Google Drive upload helper function
async function uploadToGoogleDrive(
    fileBuffer: Buffer,
    fileName: string,
    folderId: string,
    serviceAccountKey: string
): Promise<string | null> {
    try {
        // Parse service account key
        const credentials = JSON.parse(serviceAccountKey);
        
        // Create JWT client
        const auth = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/drive.file']
        );

        const drive = google.drive({ version: 'v3', auth });

        // Upload file
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            body: fileBuffer
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        });

        return response.data.id || null;
    } catch (error) {
        console.error('Google Drive upload error:', error);
        throw error;
    }
}

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

// Middleware to check baby lion role
const requireBabyLion = (req: Request, res: Response, next: any) => {
    const role = (req as any).userRole;
    if (role !== 'BABY_LION' && role !== 'ADMIN') {
        res.status(403).json({ message: 'Baby Lion access required' });
        return;
    }
    next();
};

// 1. Create Attendance Session (Admin)
router.post('/sessions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { description } = req.body;
        const userId = (req as any).userId;

        // Get admin user info
        const adminUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, studentId: true }
        });

        // Generate unique session code (6 characters)
        const code = randomBytes(3).toString('hex').toUpperCase();

        const session = await prisma.session.create({
            data: {
                code,
                description: description || null,
                isActive: true,
                createdBy: userId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            session: {
                id: session.id,
                code: session.code,
                description: session.description,
                openTime: session.openTime,
                isActive: session.isActive,
                host: adminUser ? { name: adminUser.name, studentId: adminUser.studentId } : null
            }
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 2. Get All Sessions (Admin)
router.get('/sessions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.session.findMany({
            include: {
                attendances: {
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
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true
                    }
                }
            },
            orderBy: {
                openTime: 'desc'
            }
        });

        res.json({
            success: true,
            sessions: sessions.map((session: any) => ({
                id: session.id,
                code: session.code,
                description: session.description,
                openTime: session.openTime,
                isActive: session.isActive,
                attendanceCount: session.attendances.length,
                host: session.creator ? {
                    name: session.creator.name,
                    studentId: session.creator.studentId
                } : null,
                attendances: session.attendances.map((att: any) => ({
                    id: att.id,
                    status: att.status,
                    timestamp: att.timestamp,
                    user: att.user
                }))
            }))
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 3. Get Active Sessions (User)
router.get('/sessions/active', authenticateToken, requireBabyLion, async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.session.findMany({
            where: { isActive: true },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true
                    }
                }
            },
            orderBy: {
                openTime: 'desc'
            }
        });

        res.json({
            success: true,
            sessions: sessions.map((session: any) => ({
                id: session.id,
                code: session.code,
                description: session.description,
                openTime: session.openTime,
                host: session.creator ? {
                    name: session.creator.name,
                    studentId: session.creator.studentId
                } : null
            }))
        });
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 4. Join Attendance Session (User)
router.post('/sessions/:code/join', authenticateToken, requireBabyLion, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const sessionCode = (Array.isArray(req.params.code) ? req.params.code[0] : req.params.code).toUpperCase();

        // Find session
        const session = await prisma.session.findUnique({
            where: { code: sessionCode }
        });

        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }

        if (!session.isActive) {
            res.status(400).json({ message: 'Session is not active' });
            return;
        }

        // Check if already attended
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                sessionId_userId: {
                    sessionId: session.id,
                    userId
                }
            }
        });

        if (existingAttendance) {
            res.status(409).json({ message: 'Already attended' });
            return;
        }

        // Create attendance
        const attendance = await prisma.attendance.create({
            data: {
                sessionId: session.id,
                userId,
                status: 'PRESENT'
            },
            include: {
                session: true,
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
            attendance: {
                id: attendance.id,
                status: attendance.status,
                timestamp: attendance.timestamp,
                session: {
                    code: attendance.session.code,
                    description: attendance.session.description
                }
            }
        });
    } catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 5. Get My Attendances (User)
router.get('/my', authenticateToken, requireBabyLion, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const attendances = await prisma.attendance.findMany({
            where: { userId },
            include: {
                session: true
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        res.json({
            success: true,
            attendances: attendances.map((att: any) => ({
                id: att.id,
                status: att.status,
                timestamp: att.timestamp,
                session: {
                    id: att.session.id,
                    code: att.session.code,
                    description: att.session.description,
                    openTime: att.session.openTime
                }
            }))
        });
    } catch (error) {
        console.error('Get my attendances error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 6. Close Session (Admin)
router.patch('/sessions/:id/close', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const sessionId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

        const session = await prisma.session.update({
            where: { id: sessionId },
            data: { isActive: false }
        });

        res.json({
            success: true,
            session: {
                id: session.id,
                code: session.code,
                isActive: session.isActive
            }
        });
    } catch (error) {
        console.error('Close session error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 7. Reactivate Session (Admin)
router.patch('/sessions/:id/reactivate', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const sessionId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

        const session = await prisma.session.update({
            where: { id: sessionId },
            data: { isActive: true }
        });

        res.json({
            success: true,
            session: {
                id: session.id,
                code: session.code,
                isActive: session.isActive
            }
        });
    } catch (error) {
        console.error('Reactivate session error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 8. Delete Session (Admin)
router.delete('/sessions/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const sessionId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

        // Delete all attendances first (due to foreign key constraint)
        await prisma.attendance.deleteMany({
            where: { sessionId }
        });

        // Delete session
        await prisma.session.delete({
            where: { id: sessionId }
        });

        res.json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 9. Export Session Attendances to Excel (Admin)
router.get('/sessions/:id/export', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const sessionId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                attendances: {
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
                        timestamp: 'asc'
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true
                    }
                }
            }
        });

        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }

        // Prepare data for Excel
        const excelData = session.attendances.map((att: any, index: number) => ({
            '번호': index + 1,
            '학번': att.user.studentId,
            '이름': att.user.name || '',
            '전공': att.user.major || '',
            '출석 시간': new Date(att.timestamp).toLocaleString('ko-KR'),
            '상태': att.status === 'PRESENT' ? '출석' : att.status === 'LATE' ? '지각' : '결석'
        }));

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        worksheet['!cols'] = [
            { wch: 8 },  // 번호
            { wch: 12 }, // 학번
            { wch: 15 }, // 이름
            { wch: 20 }, // 전공
            { wch: 25 }, // 출석 시간
            { wch: 10 }  // 상태
        ];

        // Add worksheet to workbook
        const sheetName = session.description || `세션_${session.code}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Generate file name: 세션이름_호스트_일자
        const sessionName = (session.description || `세션_${session.code}`).replace(/[<>:"/\\|?*]/g, '_'); // 파일명에 사용할 수 없는 문자 제거
        const hostName = session.creator 
            ? (session.creator.name || session.creator.studentId).replace(/[<>:"/\\|?*]/g, '_')
            : '알수없음';
        const dateStr = new Date(session.openTime).toISOString().split('T')[0].replace(/-/g, '');
        const fileName = `${sessionName}_${hostName}_${dateStr}.xlsx`;

        // Upload to Google Drive if configured
        let driveFileId: string | null = null;
        if (process.env.GOOGLE_DRIVE_FOLDER_ID && process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY) {
            try {
                driveFileId = await uploadToGoogleDrive(excelBuffer, fileName, process.env.GOOGLE_DRIVE_FOLDER_ID, process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY);
            } catch (driveError) {
                console.error('Google Drive upload error:', driveError);
                // Continue even if upload fails
            }
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

        // Send file
        res.send(excelBuffer);
    } catch (error) {
        console.error('Export session error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

