import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { fetchGoogleFormResponses, parseFormResponse } from '../utils/googleSheets';

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

        if (!['FRONTEND', 'BACKEND', 'DESIGN', 'PM'].includes(track)) {
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
                phoneLastDigits: app.phoneLastDigits,
                interviewPreferences: app.interviewPreferences ? JSON.parse(app.interviewPreferences) : null,
                confirmedInterviewDate: app.confirmedInterviewDate,
                confirmedInterviewTime: app.confirmedInterviewTime,
                createdAt: app.createdAt,
                user: app.user
            }))
        });
    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 4. Update Application Status (Admin) - 서류합격/최종합격/거절
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const applicationId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        const { status } = req.body;

        if (!['DOCUMENT_APPROVED', 'INTERVIEW_APPROVED', 'REJECTED'].includes(status)) {
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

        // 최종합격 시에만 BABY_LION으로 변경
        // 계정은 지원서 생성 시 이미 생성되므로, 역할만 변경
        if (status === 'INTERVIEW_APPROVED') {
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

// 5. Get Result by Student Info (Public - No Auth Required)
router.post('/result', async (req: Request, res: Response) => {
    try {
        const { studentId, name, phoneLastDigits } = req.body;

        if (!studentId || !name || !phoneLastDigits) {
            res.status(400).json({ message: '학번, 이름, 전화번호 뒷자리를 모두 입력해주세요' });
            return;
        }

        // Check settings
        const settings = await prisma.applicationSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        const now = new Date();

        // 단계별 결과 공개 체크
        const hasNewDateSettings = !!settings?.documentResultStartDate;
        const canViewDocumentResult = settings?.documentResultStartDate && now >= settings.documentResultStartDate;
        const canSelectInterviewTime = settings?.documentResultStartDate && settings?.documentResultEndDate &&
            now >= settings.documentResultStartDate && now <= settings.documentResultEndDate;
        const canViewInterviewSchedule = settings?.interviewScheduleDate && now >= settings.interviewScheduleDate;
        const canViewFinalResult = settings?.finalResultDate && now >= settings.finalResultDate;

        // 새 날짜 설정이 있으면 그것만 사용, 없으면 기존 resultOpenDate 사용
        const canViewAnyResult = hasNewDateSettings
            ? canViewDocumentResult
            : (settings?.resultOpenDate && now >= settings.resultOpenDate);

        if (!canViewAnyResult) {
            res.status(403).json({
                message: '결과 공개 기간이 아닙니다',
                documentResultStartDate: settings?.documentResultStartDate || null,
                resultOpenDate: settings?.resultOpenDate || null
            });
            return;
        }

        // Find application
        const user = await prisma.user.findUnique({
            where: { studentId },
            include: {
                application: true
            }
        });

        if (!user || !user.application) {
            res.status(404).json({ message: '지원서를 찾을 수 없습니다' });
            return;
        }

        // Verify name and phone last digits
        if (user.name !== name || user.application.phoneLastDigits !== phoneLastDigits) {
            res.status(401).json({ message: '정보가 일치하지 않습니다' });
            return;
        }

        // 단계별로 정보 반환
        const result: any = {
            status: user.application.status,
            track: user.application.track,
            // 시기 정보
            canSelectInterviewTime,
            canViewInterviewSchedule,
            canViewFinalResult
        };

        // 서류 합격자의 면접 일정 선호도 (본인이 제출한 것)
        if (user.application.interviewPreferences) {
            result.interviewPreferences = JSON.parse(user.application.interviewPreferences);
        }

        // 면접 일정 공개일 이후에만 확정된 일정 표시
        if (canViewInterviewSchedule && user.application.confirmedInterviewDate && user.application.confirmedInterviewTime) {
            result.confirmedInterviewDate = user.application.confirmedInterviewDate;
            result.confirmedInterviewTime = user.application.confirmedInterviewTime;
        }

        // 최종 결과 공개일 이전에는 최종합격 상태를 숨김 (서류합격으로 표시)
        if (!canViewFinalResult && user.application.status === 'INTERVIEW_APPROVED') {
            result.status = 'DOCUMENT_APPROVED';
            result.finalResultPending = true;
        }

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 6. Submit Interview Preferences (Approved Applicants)
router.post('/interview-preferences', async (req: Request, res: Response) => {
    try {
        const { studentId, name, phoneLastDigits, times } = req.body;

        if (!studentId || !name || !phoneLastDigits || !times || !Array.isArray(times) || times.length !== 3) {
            res.status(400).json({ message: '모든 정보를 올바르게 입력해주세요' });
            return;
        }

        // 면접 일정 선택 기간 체크
        const appSettings = await prisma.applicationSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        const now = new Date();
        const canSelectInterviewTime = appSettings?.documentResultStartDate && appSettings?.documentResultEndDate &&
            now >= appSettings.documentResultStartDate && now <= appSettings.documentResultEndDate;

        // 하위 호환: 새 설정이 없으면 기존 로직 사용
        const hasNewSettings = appSettings?.documentResultStartDate && appSettings?.documentResultEndDate;
        if (hasNewSettings && !canSelectInterviewTime) {
            res.status(403).json({
                message: '면접 일정 선택 기간이 아닙니다',
                startDate: appSettings?.documentResultStartDate,
                endDate: appSettings?.documentResultEndDate
            });
            return;
        }

        // 면접 설정 가져오기
        const interviewSettings = await prisma.interviewSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        // 동적으로 유효한 날짜/시간 생성
        let validDates: string[];
        let validTimes: string[];

        if (interviewSettings) {
            validDates = JSON.parse(interviewSettings.availableDates);

            // 시간 옵션 생성
            validTimes = [];
            const [startHour, startMin] = interviewSettings.startTime.split(':').map(Number);
            const [endHour, endMin] = interviewSettings.endTime.split(':').map(Number);
            const interval = interviewSettings.intervalMinutes;

            let currentMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            while (currentMinutes <= endMinutes) {
                const h = Math.floor(currentMinutes / 60);
                const m = currentMinutes % 60;
                validTimes.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                currentMinutes += interval;
            }
        } else {
            // 기본값 (2026년 2월)
            validDates = ['2026-02-23', '2026-02-24', '2026-02-25'];
            validTimes = [];
            for (let hour = 9; hour <= 15; hour++) {
                validTimes.push(`${hour.toString().padStart(2, '0')}:00`);
                validTimes.push(`${hour.toString().padStart(2, '0')}:20`);
                validTimes.push(`${hour.toString().padStart(2, '0')}:40`);
            }
            validTimes.push('16:00');
        }

        for (const timeObj of times) {
            if (!timeObj.priority || !timeObj.date || !timeObj.time) {
                res.status(400).json({ message: '각 순위마다 날짜와 시간을 모두 선택해주세요' });
                return;
            }
            if (!validDates.includes(timeObj.date)) {
                res.status(400).json({ message: `유효하지 않은 날짜입니다. 가능한 날짜: ${validDates.join(', ')}` });
                return;
            }
            if (!validTimes.includes(timeObj.time)) {
                res.status(400).json({ message: `유효하지 않은 시간입니다.` });
                return;
            }
        }

        // Check priorities (must be 1, 2, 3)
        const priorities = times.map((t: any) => t.priority).sort();
        if (JSON.stringify(priorities) !== JSON.stringify([1, 2, 3])) {
            res.status(400).json({ message: '우선순위는 1, 2, 3이어야 합니다' });
            return;
        }

        // Find user and application
        const user = await prisma.user.findUnique({
            where: { studentId },
            include: { application: true }
        });

        if (!user || !user.application) {
            res.status(404).json({ message: '지원서를 찾을 수 없습니다' });
            return;
        }

        // Verify name and phone
        if (user.name !== name || user.application.phoneLastDigits !== phoneLastDigits) {
            res.status(401).json({ message: '정보가 일치하지 않습니다' });
            return;
        }

        // Check if document approved (서류합격한 지원자만 면접 일정 선택 가능)
        // INTERVIEW_APPROVED도 허용 (최종 결과 공개 전에는 DOCUMENT_APPROVED로 보이므로)
        if (user.application.status !== 'DOCUMENT_APPROVED' && user.application.status !== 'INTERVIEW_APPROVED') {
            res.status(403).json({ message: '서류합격한 지원자만 면접 일정을 선택할 수 있습니다' });
            return;
        }

        // Update application with interview preferences
        await prisma.application.update({
            where: { id: user.application.id },
            data: {
                phoneLastDigits,
                interviewPreferences: JSON.stringify({ times })
            }
        });

        res.json({
            success: true,
            message: '면접 일정이 제출되었습니다'
        });
    } catch (error) {
        console.error('Submit interview preferences error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 7. Confirm Interview Schedule (Admin)
router.patch('/:id/interview-confirm', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const applicationId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        const { date, time } = req.body;

        if (!date || !time) {
            res.status(400).json({ message: '날짜와 시간을 입력해주세요' });
            return;
        }

        const application = await prisma.application.findUnique({
            where: { id: applicationId }
        });

        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }

        const confirmedDate = new Date(date + 'T' + time + ':00');

        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: {
                confirmedInterviewDate: confirmedDate,
                confirmedInterviewTime: time
            },
            include: {
                user: true
            }
        });

        // 면접 일정 확정은 별도로 처리 (최종합격은 관리자가 별도로 처리)

        res.json({
            success: true,
            application: {
                ...updatedApplication,
                user: {
                    id: updatedApplication.user.id,
                    studentId: updatedApplication.user.studentId,
                    name: updatedApplication.user.name,
                    major: updatedApplication.user.major
                }
            }
        });
    } catch (error) {
        console.error('Confirm interview error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 7-1. Update Application Track (Admin)
router.patch('/:id/track', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const applicationId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
        const { track } = req.body;

        if (!track) {
            res.status(400).json({ message: '트랙을 입력해주세요' });
            return;
        }

        if (!['FRONTEND', 'BACKEND', 'DESIGN', 'PM'].includes(track)) {
            res.status(400).json({ message: '올바른 트랙을 선택해주세요' });
            return;
        }

        const application = await prisma.application.findUnique({
            where: { id: applicationId }
        });

        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }

        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: { track },
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
        console.error('Update application track error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 8. Get/Set Result Open Date (Admin)
router.get('/settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const settings = await prisma.applicationSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            settings: settings || null
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const {
            resultOpenDate,
            googleFormUrl,
            documentResultStartDate,
            documentResultEndDate,
            interviewScheduleDate,
            finalResultDate
        } = req.body;

        // Get or create settings
        const existingSettings = await prisma.applicationSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        const updateData: any = {};

        // 날짜 필드 처리 헬퍼 함수
        const processDate = (dateStr: string | undefined | null) => {
            if (dateStr === null) return null;
            if (!dateStr) return undefined;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return undefined;
            return date;
        };

        if (resultOpenDate) {
            const date = processDate(resultOpenDate);
            if (date === undefined && resultOpenDate) {
                res.status(400).json({ message: '올바른 날짜 형식이 아닙니다' });
                return;
            }
            if (date) updateData.resultOpenDate = date;
        }

        // 새로운 날짜 필드들 처리
        const docStart = processDate(documentResultStartDate);
        if (docStart !== undefined) updateData.documentResultStartDate = docStart;

        const docEnd = processDate(documentResultEndDate);
        if (docEnd !== undefined) updateData.documentResultEndDate = docEnd;

        const interviewSchedule = processDate(interviewScheduleDate);
        if (interviewSchedule !== undefined) updateData.interviewScheduleDate = interviewSchedule;

        const finalResult = processDate(finalResultDate);
        if (finalResult !== undefined) updateData.finalResultDate = finalResult;

        if (googleFormUrl !== undefined) {
            updateData.googleFormUrl = googleFormUrl || null;
        }

        let settings;
        if (existingSettings) {
            settings = await prisma.applicationSettings.update({
                where: { id: existingSettings.id },
                data: updateData
            });
        } else {
            if (!resultOpenDate) {
                res.status(400).json({ message: '결과 공개일을 입력해주세요' });
                return;
            }
            settings = await prisma.applicationSettings.create({
                data: {
                    resultOpenDate: new Date(resultOpenDate),
                    googleFormUrl: googleFormUrl || null,
                    documentResultStartDate: docStart || null,
                    documentResultEndDate: docEnd || null,
                    interviewScheduleDate: interviewSchedule || null,
                    finalResultDate: finalResult || null
                }
            });
        }

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Set settings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 8-1. Get Google Form URL (Public - No Auth Required)
router.get('/google-form-url', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.applicationSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            googleFormUrl: settings?.googleFormUrl || null
        });
    } catch (error) {
        console.error('Get google form URL error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 9. Create Application Manually (Admin)
router.post('/create', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { studentId, name, phoneLastDigits, track, content } = req.body;

        if (!studentId || !name || !phoneLastDigits || !track) {
            res.status(400).json({ message: '학번, 이름, 전화번호 뒷자리, 트랙을 모두 입력해주세요' });
            return;
        }

        if (!['FRONTEND', 'BACKEND', 'DESIGN', 'PM'].includes(track)) {
            res.status(400).json({ message: '올바른 트랙을 선택해주세요' });
            return;
        }

        // 전화번호 뒷자리 검증 (4자리)
        if (!/^\d{4}$/.test(phoneLastDigits)) {
            res.status(400).json({ message: '전화번호 뒷자리는 4자리 숫자여야 합니다' });
            return;
        }

        // 사용자 찾기 또는 생성
        let user = await prisma.user.findUnique({
            where: { studentId }
        });

        if (!user) {
            // 사용자가 없으면 생성 (임시 비밀번호: 학번)
            const hashedPassword = await bcrypt.hash(studentId, 10);
            user = await prisma.user.create({
                data: {
                    studentId,
                    password: hashedPassword,
                    name,
                    role: 'GUEST'
                }
            });
        } else {
            // 사용자가 있으면 이름 업데이트
            await prisma.user.update({
                where: { id: user.id },
                data: { name }
            });
        }

        // 이미 지원서가 있는지 확인
        const existingApp = await prisma.application.findUnique({
            where: { userId: user.id }
        });

        if (existingApp) {
            res.status(409).json({ message: '이미 지원서가 존재합니다' });
            return;
        }

        // 지원서 생성
        const application = await prisma.application.create({
            data: {
                userId: user.id,
                track,
                content: content || '구글폼 제출',
                phoneLastDigits,
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

        res.json({
            success: true,
            application: {
                id: application.id,
                track: application.track,
                status: application.status,
                user: application.user
            }
        });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 10. Import Applications from Google Form (Admin)
router.post('/import-from-google-form', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { spreadsheetId, sheetName } = req.body;

        if (!spreadsheetId) {
            res.status(400).json({ message: '구글 시트 ID를 입력해주세요' });
            return;
        }

        // 구글 시트에서 데이터 가져오기
        const range = sheetName ? `${sheetName}!A:Z` : 'A:Z';
        const rows = await fetchGoogleFormResponses(spreadsheetId, range);

        if (rows.length < 2) {
            res.status(400).json({ message: '시트에 데이터가 없습니다' });
            return;
        }

        // 첫 번째 행은 헤더
        const headers = rows[0];
        const dataRows = rows.slice(1);

        const results = {
            imported: 0,
            skipped: 0,
            errors: [] as string[]
        };

        // 각 행을 처리
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            try {
                const parsed = parseFormResponse(row, headers);

                if (!parsed.studentId || !parsed.name) {
                    results.skipped++;
                    continue;
                }

                // 사용자 찾기 또는 생성
                let user = await prisma.user.findUnique({
                    where: { studentId: parsed.studentId }
                });

                if (!user) {
                    // 사용자가 없으면 생성 (임시 비밀번호)
                    const hashedPassword = await bcrypt.hash(parsed.studentId, 10);
                    user = await prisma.user.create({
                        data: {
                            studentId: parsed.studentId,
                            password: hashedPassword,
                            name: parsed.name,
                            role: 'GUEST'
                        }
                    });
                }

                // 이미 지원서가 있는지 확인
                const existingApp = await prisma.application.findUnique({
                    where: { userId: user.id }
                });

                if (existingApp) {
                    results.skipped++;
                    continue;
                }

                // 트랙이 없으면 스킵
                if (!parsed.track) {
                    results.skipped++;
                    continue;
                }

                // 지원서 생성
                await prisma.application.create({
                    data: {
                        userId: user.id,
                        track: parsed.track as 'FRONTEND' | 'BACKEND' | 'DESIGN' | 'PM',
                        content: parsed.content,
                        phoneLastDigits: parsed.phoneLastDigits,
                        status: 'PENDING'
                    }
                });

                results.imported++;
            } catch (error: any) {
                results.errors.push(`행 ${i + 2}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Import from Google Form error:', error);
        res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
});

// 11. Get Interview Settings (Public - for applicants to see available dates/times)
router.get('/interview-settings', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.interviewSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        // 기본값 반환
        if (!settings) {
            res.json({
                success: true,
                settings: {
                    availableDates: ['2026-02-23', '2026-02-24', '2026-02-25'],
                    startTime: '09:00',
                    endTime: '16:00',
                    intervalMinutes: 20
                }
            });
            return;
        }

        res.json({
            success: true,
            settings: {
                availableDates: JSON.parse(settings.availableDates),
                startTime: settings.startTime,
                endTime: settings.endTime,
                intervalMinutes: settings.intervalMinutes
            }
        });
    } catch (error) {
        console.error('Get interview settings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 12. Set Interview Settings (Admin)
router.post('/interview-settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { availableDates, startTime, endTime, intervalMinutes } = req.body;

        // 유효성 검사
        if (availableDates && !Array.isArray(availableDates)) {
            res.status(400).json({ message: '면접 가능 날짜는 배열이어야 합니다' });
            return;
        }

        if (intervalMinutes && ![10, 15, 20, 30].includes(intervalMinutes)) {
            res.status(400).json({ message: '면접 시간 간격은 10, 15, 20, 30분 중 하나여야 합니다' });
            return;
        }

        // 시간 형식 검증 (HH:mm)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (startTime && !timeRegex.test(startTime)) {
            res.status(400).json({ message: '시작 시간 형식이 올바르지 않습니다 (HH:mm)' });
            return;
        }
        if (endTime && !timeRegex.test(endTime)) {
            res.status(400).json({ message: '종료 시간 형식이 올바르지 않습니다 (HH:mm)' });
            return;
        }

        // 기존 설정 찾기
        const existingSettings = await prisma.interviewSettings.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        const updateData: any = {};
        if (availableDates) updateData.availableDates = JSON.stringify(availableDates);
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (intervalMinutes) updateData.intervalMinutes = intervalMinutes;

        let settings;
        if (existingSettings) {
            settings = await prisma.interviewSettings.update({
                where: { id: existingSettings.id },
                data: updateData
            });
        } else {
            settings = await prisma.interviewSettings.create({
                data: {
                    availableDates: JSON.stringify(availableDates || ['2026-02-23', '2026-02-24', '2026-02-25']),
                    startTime: startTime || '09:00',
                    endTime: endTime || '16:00',
                    intervalMinutes: intervalMinutes || 20
                }
            });
        }

        res.json({
            success: true,
            settings: {
                availableDates: JSON.parse(settings.availableDates),
                startTime: settings.startTime,
                endTime: settings.endTime,
                intervalMinutes: settings.intervalMinutes
            }
        });
    } catch (error) {
        console.error('Set interview settings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

