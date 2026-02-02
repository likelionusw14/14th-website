import { spawn } from 'child_process';
import { logger } from './logger';
import * as path from 'path';
import * as fs from 'fs';

export interface UserPortalData {
    verified: boolean;
    name?: string;
    major?: string;
}

/**
 * Python 스크립트를 실행하여 포털 인증 및 사용자 정보를 가져옵니다.
 */
export const verifyPortalCredentials = async (studentId: string, password: string): Promise<UserPortalData> => {
    try {
        // Python 스크립트 경로
        // __dirname은 dist/utils를 가리키므로, ../../temp-portal-ref/backend로 이동
        // dist/utils -> dist -> server -> temp-portal-ref/backend
        const scriptDir = path.join(__dirname, '../../temp-portal-ref/backend');
        const scriptName = 'portal_verify.py';
        const pythonScriptPath = path.join(scriptDir, scriptName);
        
        // Python 스크립트가 없으면 에러
        if (!fs.existsSync(pythonScriptPath)) {
            logger.error(`[PortalScraperPython] Python script not found at: ${pythonScriptPath}`);
            return { verified: false };
        }

        logger.info(`[PortalScraperPython] Starting verification for StudentID: ${studentId}`);
        logger.info(`[PortalScraperPython] Python script path: ${pythonScriptPath}`);
        
        // Python 스크립트 실행 (상대 경로 사용)
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        const pythonProcess = spawn(pythonCommand, [scriptName, studentId, password], {
            cwd: scriptDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true // Windows에서 경로 문제 해결
        });

        let stdout = '';
        let stderr = '';

        if (pythonProcess.stdout) {
            pythonProcess.stdout.setEncoding('utf8');
            pythonProcess.stdout.on('data', (data: Buffer | string) => {
                stdout += data.toString();
            });
        }

        if (pythonProcess.stderr) {
            pythonProcess.stderr.setEncoding('utf8');
            pythonProcess.stderr.on('data', (data: Buffer | string) => {
                stderr += data.toString();
                // Python의 print(..., file=sys.stderr) 출력도 stderr에 포함됨
            });
        }

        const exitCode = await new Promise<number>((resolve) => {
            pythonProcess.on('close', (code: number | null) => {
                resolve(code || 0);
            });
        });
        
        if (exitCode !== 0) {
            logger.error(`[PortalScraperPython] Python script failed with exit code ${exitCode}`);
            logger.error(`[PortalScraperPython] stderr: ${stderr}`);
            return { verified: false };
        }

        // JSON 응답 파싱
        try {
            const result = JSON.parse(stdout.trim());
            
            return {
                verified: result.verified || false,
                name: result.name || undefined,
                major: result.major || undefined
            };
        } catch (parseError) {
            logger.error(`[PortalScraperPython] Failed to parse JSON response: ${stdout}`);
            return { verified: false };
        }
    } catch (error: any) {
        logger.error(`[PortalScraperPython] Error: ${error.message}`);
        return { verified: false };
    }
};


