import { google } from 'googleapis';
import { Track } from '@prisma/client';

// Google Sheets API 클라이언트 생성
export async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
}

// 구글 시트에서 데이터 가져오기
export async function fetchGoogleFormResponses(spreadsheetId: string, range: string = 'A:Z') {
    try {
        const sheets = await getGoogleSheetsClient();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values || [];
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        throw error;
    }
}

// 구글폼 응답을 파싱하여 지원서 데이터로 변환
// 시트 형식: [타임스탬프, 학번, 이름, 전화번호, 트랙, 지원동기, ...]
export function parseFormResponse(row: string[], headers: string[]): {
    studentId: string;
    name: string;
    phoneLastDigits: string;
    track: Track | null;
    content: string;
} {
    // 헤더에서 인덱스 찾기
    const getIndex = (headerName: string) => {
        const index = headers.findIndex(h => 
            h.toLowerCase().includes(headerName.toLowerCase())
        );
        return index >= 0 ? index : -1;
    };

    const studentIdIndex = getIndex('학번');
    const nameIndex = getIndex('이름');
    const phoneIndex = getIndex('전화번호');
    const trackIndex = getIndex('트랙');
    const contentIndex = getIndex('지원동기') || getIndex('자기소개') || getIndex('내용');

    // 전화번호에서 뒷자리 추출 (4자리)
    const phone = row[phoneIndex] || '';
    const phoneLastDigits = phone.length >= 4 
        ? phone.slice(-4) 
        : phone;

    // 트랙 파싱
    const trackValue = row[trackIndex]?.toUpperCase() || '';
    const track: Track | null = 
        trackValue.includes('FRONTEND') || trackValue.includes('프론트') ? Track.FRONTEND : 
        trackValue.includes('BACKEND') || trackValue.includes('백엔드') ? Track.BACKEND :
        trackValue.includes('DESIGN') || trackValue.includes('디자인') ? Track.DESIGN :
        trackValue.includes('PM') || trackValue.includes('기획') ? Track.PM :
        null;

    return {
        studentId: row[studentIdIndex]?.trim() || '',
        name: row[nameIndex]?.trim() || '',
        phoneLastDigits: phoneLastDigits,
        track: track,
        content: row[contentIndex] || row.slice(Math.max(studentIdIndex, nameIndex, phoneIndex, trackIndex) + 1).join('\n'),
    };
}
