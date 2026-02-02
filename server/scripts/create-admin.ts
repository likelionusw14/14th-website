import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function createAdmin() {
    try {
        console.log('=== 관리자 계정 생성 ===\n');

        const studentId = await question('학번을 입력하세요: ');
        if (!studentId) {
            console.error('학번은 필수입니다.');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { studentId }
        });

        if (existingUser) {
            console.log(`\n이미 존재하는 사용자입니다: ${existingUser.name || studentId}`);
            const update = await question('역할을 ADMIN으로 변경하시겠습니까? (y/n): ');
            if (update.toLowerCase() === 'y') {
                await prisma.user.update({
                    where: { studentId },
                    data: { role: 'ADMIN' }
                });
                console.log('✅ 역할이 ADMIN으로 변경되었습니다.');
            }
            process.exit(0);
        }

        const name = await question('이름을 입력하세요: ');
        const password = await question('비밀번호를 입력하세요: ');
        const confirmPassword = await question('비밀번호를 다시 입력하세요: ');

        if (password !== confirmPassword) {
            console.error('비밀번호가 일치하지 않습니다.');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('비밀번호는 최소 6자 이상이어야 합니다.');
            process.exit(1);
        }

        const major = await question('전공을 입력하세요 (선택사항): ');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                studentId,
                password: hashedPassword,
                name: name || null,
                major: major || null,
                role: 'ADMIN'
            }
        });

        console.log('\n✅ 관리자 계정이 생성되었습니다!');
        console.log(`학번: ${admin.studentId}`);
        console.log(`이름: ${admin.name || 'N/A'}`);
        console.log(`역할: ${admin.role}`);
        console.log(`전공: ${admin.major || 'N/A'}`);

    } catch (error) {
        console.error('오류 발생:', error);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

createAdmin();


