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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:15',message:'verifyPortalCredentials called',data:{hasStudentId:!!studentId,hasPassword:!!password,__dirname:__dirname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
        // Python 스크립트 경로
        // __dirname은 dist/utils를 가리키므로, ../../temp-portal-ref/backend로 이동
        // dist/utils -> dist -> server -> temp-portal-ref/backend
        const scriptDir = path.join(__dirname, '../../temp-portal-ref/backend');
        const scriptName = 'portal_verify.py';
        const pythonScriptPath = path.join(scriptDir, scriptName);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:22',message:'Checking Python script path',data:{scriptDir,scriptName,pythonScriptPath,exists:fs.existsSync(pythonScriptPath)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Python 스크립트가 없으면 에러
        if (!fs.existsSync(pythonScriptPath)) {
            logger.error(`[PortalScraperPython] Python script not found at: ${pythonScriptPath}`);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:26',message:'Python script not found',data:{pythonScriptPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            return { verified: false };
        }

        logger.info(`[PortalScraperPython] Starting verification for StudentID: ${studentId}`);
        logger.info(`[PortalScraperPython] Python script path: ${pythonScriptPath}`);
        
        // Python 스크립트 실행 (상대 경로 사용)
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:34',message:'Spawning Python process',data:{pythonCommand,scriptDir,platform:process.platform},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
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
            pythonProcess.on('error', (err: NodeJS.ErrnoException) => {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:59',message:'Python process error event',data:{error:err.message,code:(err as any).code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
            });
        });
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:65',message:'Python process exited',data:{exitCode,stdoutLength:stdout.length,stderrLength:stderr.length,hasStdout:!!stdout,hasStderr:!!stderr},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (exitCode !== 0) {
            logger.error(`[PortalScraperPython] Python script failed with exit code ${exitCode}`);
            logger.error(`[PortalScraperPython] stderr: ${stderr}`);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:68',message:'Python script failed',data:{exitCode,stderr:stderr.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            return { verified: false };
        }

        // JSON 응답 파싱
        try {
            const result = JSON.parse(stdout.trim());
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:75',message:'JSON parsed successfully',data:{verified:result.verified,hasName:!!result.name,hasMajor:!!result.major},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            return {
                verified: result.verified || false,
                name: result.name || undefined,
                major: result.major || undefined
            };
        } catch (parseError) {
            logger.error(`[PortalScraperPython] Failed to parse JSON response: ${stdout}`);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:81',message:'JSON parse error',data:{stdout:stdout.substring(0,200),parseError:parseError instanceof Error?parseError.message:String(parseError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return { verified: false };
        }
    } catch (error: any) {
        logger.error(`[PortalScraperPython] Error: ${error.message}`);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraperPython.ts:84',message:'Exception in verifyPortalCredentials',data:{error:error.message,errorName:error.name,errorStack:error.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return { verified: false };
    }
};


