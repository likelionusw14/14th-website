import axios from 'axios';
import https from 'https';
import { logger } from './logger';
import * as cheerio from 'cheerio';

// Legacy SSL Adapter equivalent for Node.js
const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Verify=False equivalent
    ciphers: 'DEFAULT@SECLEVEL=1', // Try to match legacy cipher requirements if possible
});

const client = axios.create({
    httpsAgent,
    headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    },
    withCredentials: true, // Important for cookies
});

export interface UserPortalData {
    verified: boolean;
    name?: string;
    major?: string;
}

export const verifyPortalCredentials = async (studentId: string, password: string): Promise<UserPortalData> => {
    try {
        // Collect cookies from all responses (like Python's requests.Session())
        const cookieJar: string[] = [];
        
        const extractCookies = (headers: any): void => {
            const setCookies = headers['set-cookie'];
            if (setCookies) {
                const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];
                cookieArray.forEach((cookie: string) => {
                    const cookieValue = cookie.split(';')[0].trim();
                    if (cookieValue) {
                        const cookieName = cookieValue.split('=')[0];
                        const existingIndex = cookieJar.findIndex(c => c.startsWith(cookieName + '='));
                        if (existingIndex >= 0) {
                            cookieJar[existingIndex] = cookieValue;
                        } else {
                            cookieJar.push(cookieValue);
                        }
                    }
                });
            }
        };
        
        const updateClientCookies = (): void => {
            if (cookieJar.length > 0) {
                client.defaults.headers.common['Cookie'] = cookieJar.join('; ');
            }
        };
        
        // 1. Fetch Portal Page (to establish session/cookies if needed)
        logger.info(`[PortalScraper] Starting verification for StudentID: ${studentId}`);
        const portalUrl = 'https://portal.suwon.ac.kr/enview/index.jsp';
        const portalResp = await client.get(portalUrl);
        extractCookies(portalResp.headers);
        updateClientCookies();
        logger.info('[PortalScraper] Initial portal page fetched');

        // 2. Login Action
        const loginUrl = 'https://portal.suwon.ac.kr/enpass/login?_epLogin_=enview&service=https://portal.suwon.ac.kr/enview/user/enpassLoginProcess.face?destination=/enview/portal/?langKnd=ko';

        const params = new URLSearchParams();
        params.append('userId', studentId);
        params.append('pwd', password);
        params.append('langKnd', 'ko');
        params.append('_enpass_login_', 'submit');
        params.append('gateway', 'true');
        params.append('username', studentId);
        params.append('password', password);

        logger.info('[PortalScraper] Sending login request...');
        const loginResp = await client.post(loginUrl, params);
        extractCookies(loginResp.headers);
        updateClientCookies();
        logger.info(`[PortalScraper] Login response status: ${loginResp.status}`);
        
        // #region agent log
        const loginResponseData = typeof loginResp.data === 'string' ? loginResp.data : JSON.stringify(loginResp.data);
        const loginResponseSample = loginResponseData.substring(0, 1000);
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:50',message:'Login response received',data:{status:loginResp.status,responseLength:loginResponseData.length,responseSample:loginResponseSample,hasError:loginResponseData.includes('비밀번호가 일치하지 않습니다') || loginResponseData.includes('존재하지 않는 사용자') || loginResponseData.includes('로그인 실패')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        if (loginResp.data.includes('비밀번호가 일치하지 않습니다') || loginResp.data.includes('존재하지 않는 사용자') || loginResp.data.includes('로그인 실패')) {
            logger.warn('[PortalScraper] Login failed: Invalid credentials or user not found');
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:55',message:'Login failed detected',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            return { verified: false };
        }

        // 3. SSO Handoff (Required to set cookies for subsequent requests)
        const ssoBaseUrl = "https://portal.suwon.ac.kr/enview/user/mainLogin.face";
        const ssoParams = { url: "https://info.suwon.ac.kr/sso_security_check", langKnd: "ko" };

        logger.info('[PortalScraper] Requesting SSO Handoff...');
        const ssoResp = await client.get(ssoBaseUrl, { params: ssoParams });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:63',message:'SSO handoff response',data:{status:ssoResp.status,hasData:!!ssoResp.data,dataType:typeof ssoResp.data,dataSample:typeof ssoResp.data === 'string' ? ssoResp.data.substring(0,500) : JSON.stringify(ssoResp.data).substring(0,500),cookies:Object.keys(ssoResp.headers['set-cookie'] || {})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        // Extract cookies from SSO response
        extractCookies(ssoResp.headers);
        updateClientCookies();
        
        // Handle JS redirect if present (from reference repo line 75-79)
        // Python code: follows redirect and then immediately calls get_personal_info()
        const jsRedirectMatch = typeof ssoResp.data === 'string' ? ssoResp.data.match(/location\.href\s*=\s*["']([^"']+)["']/) : null;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:70',message:'JS redirect check',data:{hasMatch:!!jsRedirectMatch,redirectUrl:jsRedirectMatch?.[1]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (jsRedirectMatch) {
            const redirectUrl = jsRedirectMatch[1];
            const fullRedirectUrl = new URL(redirectUrl, ssoResp.request.res?.responseUrl || ssoBaseUrl).href;
            logger.info(`[PortalScraper] Following JS redirect: ${fullRedirectUrl}`);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:75',message:'Following JS redirect',data:{fullRedirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const redirectResp = await client.get(fullRedirectUrl, { maxRedirects: 5 });
            extractCookies(redirectResp.headers);
            updateClientCookies();
            // #region agent log
            const redirectResponseData = typeof redirectResp.data === 'string' ? redirectResp.data : JSON.stringify(redirectResp.data);
            const redirectResponseSample = redirectResponseData.substring(0, 1000);
            const finalRedirectUrl = redirectResp.request.res?.responseUrl || fullRedirectUrl;
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:80',message:'Redirect response received',data:{status:redirectResp.status,url:finalRedirectUrl,cookieCount:cookieJar.length,cookies:cookieJar,responseLength:redirectResponseData.length,responseSample:redirectResponseSample,hasInfoRedirect:redirectResponseData.includes('info.suwon.ac.kr'),isInfoDomain:finalRedirectUrl.includes('info.suwon.ac.kr')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // Python code: after ajaxJoin.face, the session should be established on info.suwon.ac.kr
            // Check if we were redirected to info.suwon.ac.kr domain
            // If not, check for JavaScript redirect to info.suwon.ac.kr
            if (!finalRedirectUrl.includes('info.suwon.ac.kr')) {
                const infoRedirectMatch = typeof redirectResp.data === 'string' ? redirectResp.data.match(/location\.href\s*=\s*["']([^"']*info\.suwon\.ac\.kr[^"']*)["']/) : null;
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:88',message:'Info redirect check',data:{hasMatch:!!infoRedirectMatch,redirectUrl:infoRedirectMatch?.[1]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                if (infoRedirectMatch) {
                    const infoRedirectUrl = infoRedirectMatch[1];
                    const fullInfoRedirectUrl = new URL(infoRedirectUrl, finalRedirectUrl).href;
                    logger.info(`[PortalScraper] Following info.suwon.ac.kr redirect: ${fullInfoRedirectUrl}`);
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:95',message:'Following info redirect',data:{fullInfoRedirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    const infoRedirectResp = await client.get(fullInfoRedirectUrl, { maxRedirects: 5 });
                    extractCookies(infoRedirectResp.headers);
                    updateClientCookies();
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:100',message:'Info redirect completed',data:{status:infoRedirectResp.status,finalUrl:infoRedirectResp.request.res?.responseUrl,cookieCount:cookieJar.length,cookies:cookieJar},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                } else {
                    // Python code pattern: mainLogin.face with url param should handle SSO
                    // Try visiting sso_security_check directly (it should accept the SSO ticket from the session)
                    logger.info('[PortalScraper] Attempting to establish session on info.suwon.ac.kr via sso_security_check');
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:105',message:'About to visit info.suwon.ac.kr sso_security_check',data:{url:'https://info.suwon.ac.kr/sso_security_check',cookieHeader:typeof client.defaults.headers.common['Cookie'] === 'string' ? client.defaults.headers.common['Cookie'] : ''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    try {
                        const ssoCheckResp = await client.get('https://info.suwon.ac.kr/sso_security_check', { maxRedirects: 5 });
                        extractCookies(ssoCheckResp.headers);
                        updateClientCookies();
                        // #region agent log
                        const ssoCheckFinalUrl = ssoCheckResp.request.res?.responseUrl || 'https://info.suwon.ac.kr/sso_security_check';
                        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:115',message:'sso_security_check completed',data:{status:ssoCheckResp.status,finalUrl:ssoCheckFinalUrl,hasRedirect:ssoCheckFinalUrl !== 'https://info.suwon.ac.kr/sso_security_check',cookieCount:cookieJar.length,cookies:cookieJar,responseLength:typeof ssoCheckResp.data === 'string' ? ssoCheckResp.data.length : JSON.stringify(ssoCheckResp.data).length,responseSample:typeof ssoCheckResp.data === 'string' ? ssoCheckResp.data.substring(0,500) : JSON.stringify(ssoCheckResp.data).substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                    } catch (ssoError: any) {
                        logger.warn(`[PortalScraper] sso_security_check failed: ${ssoError.message}`);
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:120',message:'sso_security_check error',data:{error:ssoError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                    }
                }
            }
        }
        
        // Python code: after ajaxJoin.face redirect, immediately calls get_personal_info()
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:125',message:'Cookies before POST request',data:{cookieCount:cookieJar.length,cookies:cookieJar,cookieHeader:typeof client.defaults.headers.common['Cookie'] === 'string' ? client.defaults.headers.common['Cookie'] : ''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        // 4. Fetch User Info from "종합정보시스템" (info.suwon.ac.kr) main page or specific API
        // Typically the main frame or header contains the user name and department.
        // Let's try fetching the main XML/Page where user info is usually displayed.
        // Based on common patterns in this school's system (WebSquare), it might be in a specific XML or just the main page HTML.

        // Strategy: Fetch a page we know contains the name. 
        // usually 'https://info.suwon.ac.kr/index.jsp' or similar might have it embedded if it's SSR, 
        // but WebSquare is often CSR.
        // Let's try to fetch the 'academic basic info' if possible, or just parse the successful login response if it had it.
        // The Python reference code implied scraping from `https://info.suwon.ac.kr/scrgBas/selectScrgBas.do` (Privacy info).

        logger.info('[PortalScraper] Fetching user details...');
        
        // Based on portal-login-test repository pattern
        // Fetch user info from 종합정보시스템 (info.suwon.ac.kr)
        let name: string | undefined = undefined;
        let major: string | undefined = undefined;

        try {
            // Method 1: Try fetching from 개인정보 조회 페이지 (scrgBas)
            // Based on reference repo: POST request with JSON data
            const infoUrl = 'https://info.suwon.ac.kr/scrgBas/selectScrgBas.do';
            logger.info(`[PortalScraper] Fetching personal info from: ${infoUrl}`);
            
            // Check cookies before POST request (Python code uses session which auto-manages cookies)
            const cookieHeader = client.defaults.headers.common['Cookie'] || '';
            const cookieHeaderStr = typeof cookieHeader === 'string' ? cookieHeader : String(cookieHeader || '');
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:100',message:'About to fetch personal info',data:{url:infoUrl,method:'POST',studentId,hasCookieHeader:!!cookieHeader,cookieHeaderLength:cookieHeaderStr.length,cookieHeader:cookieHeaderStr},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const infoResp = await client.post(infoUrl, 
                { sno: studentId }, // JSON payload
                {
                    headers: {
                        'Content-Type': 'application/json; charset="UTF-8"',
                        'Origin': 'https://info.suwon.ac.kr',
                        'Referer': 'https://info.suwon.ac.kr/websquare/websquare.jsp?w2xPath=/views/usw/sa/hj/SA_HJ_1230.xml&w2xHome=/views/&w2xDocumentRoot='
                    }
                }
            );
            // #region agent log
            const responseSample = typeof infoResp.data === 'string' ? infoResp.data.substring(0, 2000) : JSON.stringify(infoResp.data).substring(0, 2000);
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:115',message:'Personal info response received',data:{responseLength:typeof infoResp.data === 'string' ? infoResp.data.length : JSON.stringify(infoResp.data).length,responseSample,status:infoResp.status,dataType:typeof infoResp.data,isObject:typeof infoResp.data === 'object'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // Check if response is an error JSON (session expired)
            if (typeof infoResp.data === 'object' && (infoResp.data as any).errorMessage) {
                const errorData = infoResp.data as any;
                logger.warn(`[PortalScraper] Received error from info.suwon.ac.kr: ${errorData.errorMessage}`);
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:123',message:'Error response from info page',data:{errorMessage:errorData.errorMessage,errorCode:errorData.errorCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                // Skip to fallback
                throw new Error('Session not established on info.suwon.ac.kr');
            }
            
            // Response should be JSON with personal info
            // Extract name and major from JSON response
            if (typeof infoResp.data === 'object') {
                const personalData = infoResp.data as any;
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:132',message:'Parsing personal data JSON',data:{hasList:!!personalData.list,listLength:personalData.list?.length,keys:Object.keys(personalData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                // Usually returns { "list": [{ ... }] } format
                const dataList = personalData.list || (Array.isArray(personalData) ? personalData : [personalData]);
                if (dataList.length > 0) {
                    const firstItem = dataList[0];
                    // Try common field names for name and major
                    name = firstItem.korNm || firstItem.name || firstItem.hgNm || firstItem.studNm || firstItem.nm;
                    major = firstItem.deptNm || firstItem.major || firstItem.colgNm || firstItem.dept || firstItem.deptName;
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:140',message:'Extracted from JSON',data:{name:name||'undefined',major:major||'undefined',firstItemKeys:Object.keys(firstItem)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    if (name) {
                        logger.info(`[PortalScraper] Found name from JSON: ${name}`);
                    }
                    if (major) {
                        logger.info(`[PortalScraper] Found major from JSON: ${major}`);
                    }
                }
            }
            
            // Fallback: Try parsing HTML if response is HTML
            if (!name || !major) {
                const $ = cheerio.load(typeof infoResp.data === 'string' ? infoResp.data : '');
                
                // Try multiple extraction methods based on common portal patterns
                
                // Method 1: Look for hidden input fields or form fields
            const inputCount = $('input[type="hidden"], input[type="text"]').length;
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:99',message:'Starting input field search',data:{inputCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            $('input[type="hidden"], input[type="text"]').each((i, elem) => {
                const $elem = $(elem);
                const nameAttr = $elem.attr('name') || $elem.attr('id') || '';
                const value = $elem.val() as string || $elem.attr('value') || '';
                
                // Name fields
                if (!name && (nameAttr.includes('name') || nameAttr.includes('nm') || nameAttr.includes('korNm'))) {
                    if (value && /^[가-힣]{2,4}$/.test(value)) {
                        name = value;
                        logger.info(`[PortalScraper] Found name from input: ${name}`);
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:108',message:'Name found from input',data:{name,nameAttr,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                    }
                }
                
                // Major/Department fields
                if (!major && (nameAttr.includes('major') || nameAttr.includes('dept') || nameAttr.includes('deptNm') || nameAttr.includes('colgNm'))) {
                    if (value && value.length > 0) {
                        major = value;
                        logger.info(`[PortalScraper] Found major from input: ${major}`);
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:117',message:'Major found from input',data:{major,nameAttr,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                    }
                }
            });

            // Method 2: Look for text content in specific elements (WebSquare pattern)
            if (!name || !major) {
                // Try to find in script tags (WebSquare often stores data in JS)
                $('script').each((i, elem) => {
                    const scriptContent = $(elem).html() || '';
                    // Look for name pattern in script
                    if (!name) {
                        const nameMatch = scriptContent.match(/["']([가-힣]{2,4})["']/);
                        if (nameMatch && /^[가-힣]{2,4}$/.test(nameMatch[1])) {
                            name = nameMatch[1];
                            logger.info(`[PortalScraper] Found name from script: ${name}`);
                        }
                    }
                });
            }

            // Method 3: Parse from body text with regex patterns
            if (!name || !major) {
                const bodyText = $('body').text();
                // #region agent log
                const bodyTextSample = bodyText.substring(0, 500);
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:139',message:'Body text for regex parsing',data:{bodyTextLength:bodyText.length,bodyTextSample,hasName:!!name,hasMajor:!!major},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                // Pattern: "홍길동(컴퓨터학부)" or "홍길동 (컴퓨터학부)"
                const combinedPattern = /([가-힣]{2,4})\s*[\(（]\s*([가-힣\s]+(?:학부|학과|전공|과|대학))[\)）]/;
                const combinedMatch = bodyText.match(combinedPattern);
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:144',message:'Regex pattern match result',data:{combinedMatch:!!combinedMatch,match1:combinedMatch?.[1],match2:combinedMatch?.[2]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                if (combinedMatch) {
                    if (!name) name = combinedMatch[1];
                    if (!major) major = combinedMatch[2].trim();
                    logger.info(`[PortalScraper] Found from combined pattern - Name: ${name}, Major: ${major}`);
                } else {
                    // Separate patterns
                    if (!name) {
                        const namePattern = /([가-힣]{2,4})\s*님/;
                        const nameMatch = bodyText.match(namePattern);
                        if (nameMatch) {
                            name = nameMatch[1];
                            logger.info(`[PortalScraper] Found name from text: ${name}`);
                        }
                    }
                    
                    if (!major) {
                        const majorPattern = /[\(（]\s*([가-힣\s]+(?:학부|학과|전공|과|대학))[\)）]/;
                        const majorMatch = bodyText.match(majorPattern);
                        if (majorMatch) {
                            major = majorMatch[1].trim();
                            logger.info(`[PortalScraper] Found major from text: ${major}`);
                        }
                    }
                }
            }

            // Method 4: Look in table cells (common in info systems)
            if (!name || !major) {
                $('td, th, div').each((i, elem) => {
                    const text = $(elem).text().trim();
                    
                    // Name: 2-4 Korean characters, standalone
                    if (!name && /^[가-힣]{2,4}$/.test(text) && text.length >= 2 && text.length <= 4) {
                        name = text;
                        logger.info(`[PortalScraper] Found name from table/div: ${name}`);
                    }
                    
                    // Major: contains 학부, 학과, 전공, 대학
                    if (!major && /(학부|학과|전공|대학)/.test(text) && text.length < 50) {
                        // Clean up the text
                        major = text.replace(/[\(\)（）\s]/g, '').trim();
                        if (major.length > 0) {
                            logger.info(`[PortalScraper] Found major from table/div: ${major}`);
                        }
                    }
                });
                }
            }

            logger.info(`[PortalScraper] Final extraction - Name: ${name || 'not found'}, Major: ${major || 'not found'}`);
            
        } catch (infoError: any) {
            logger.warn(`[PortalScraper] Failed to fetch user info from info.suwon.ac.kr: ${infoError.message}`);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:196',message:'Error fetching info page',data:{error:infoError.message,errorStack:infoError.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // Fallback: Try parsing from portal main page
            try {
                logger.info('[PortalScraper] Trying fallback: portal dashboard');
                const dashboardUrl = 'https://portal.suwon.ac.kr/enview/portal/';
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:201',message:'Trying fallback portal dashboard',data:{url:dashboardUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                const dashboardResp = await client.get(dashboardUrl);
                const $ = cheerio.load(dashboardResp.data);
                
                const bodyText = $('body').text();
                // #region agent log
                const bodyTextSample = bodyText.substring(0, 500);
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:208',message:'Fallback body text',data:{bodyTextLength:bodyText.length,bodyTextSample},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                // Look for patterns like "홍길동(컴퓨터학부)님 환영합니다"
                const pattern = /([가-힣]{2,4})\s*[\(（]\s*([가-힣\s]+(?:학부|학과|전공|과|대학))[\)）]\s*님/;
                const match = bodyText.match(pattern);
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:213',message:'Fallback pattern match',data:{matched:!!match,match1:match?.[1],match2:match?.[2]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                if (match) {
                    name = match[1];
                    major = match[2].trim();
                    logger.info(`[PortalScraper] Extracted from portal dashboard - Name: ${name}, Major: ${major}`);
                }
            } catch (dashboardError: any) {
                logger.warn(`[PortalScraper] Fallback also failed: ${dashboardError.message}`);
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:222',message:'Fallback also failed',data:{error:dashboardError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
            }
        }

        logger.info('[PortalScraper] Verification sequence completed successfully');
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'portalScraper.ts:221',message:'Portal verification result',data:{name:name||'undefined',major:major||'undefined',hasName:!!name,hasMajor:!!major},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return { verified: true, name, major };

    } catch (error) {
        logger.error(`Portal verification error: ${error}`);
        return { verified: false };
    }
};
