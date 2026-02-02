# 멋쟁이사자처럼 수원대학교 14기 웹사이트

멋쟁이사자처럼 수원대학교 14기 공식 웹사이트입니다.

## 🌟 프로젝트 소개

멋쟁이사자처럼 수원대학교 14기 활동을 위한 통합 관리 시스템입니다. 지원서 제출, 출석 체크, 관리자 패널 등 다양한 기능을 제공합니다.

## 🛠 기술 스택

### Frontend
- **React** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS v4** - 스타일링
- **Framer Motion** - 애니메이션

### Backend
- **Node.js** - 런타임 환경
- **Express** - 웹 프레임워크
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스
- **JWT** - 인증

## ✨ 주요 기능

- 🔐 **포털 인증**: 수원대학교 포털 계정으로 본인 인증
- 📝 **지원서 시스템**: 트랙별 지원서 제출 및 관리
- ✅ **출석 체크**: 실시간 출석 체크 세션 관리
- 👨‍💼 **관리자 패널**: 지원서 승인/거절, 세션 관리, 엑셀 다운로드
- 🎨 **스페이스 테마**: 커스텀 파티클 애니메이션 및 갤럭시 디자인

## 🚀 시작하기

### 사전 요구사항

- Node.js (v18 이상)
- PostgreSQL
- Python 3.x (백엔드 포털 인증용)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd LikeLionSuwonSite
   ```

2. **의존성 설치**
   ```bash
   # 루트 디렉토리
   npm install
   
   # 백엔드 디렉토리
   cd server
   npm install
   ```

3. **환경 변수 설정**
   - `server/.env` 파일 생성 및 데이터베이스 연결 정보 설정
   - 루트 디렉토리에 `.env` 파일 생성 및 API URL 설정

4. **데이터베이스 마이그레이션**
   ```bash
   cd server
   npx prisma migrate dev
   ```

5. **개발 서버 실행**
   ```bash
   # 백엔드 서버 (터미널 1)
   cd server
   npm run dev
   
   # 프론트엔드 서버 (터미널 2)
   npm run dev
   ```

## 📁 프로젝트 구조

```
LikeLionSuwonSite/
├── src/                    # 프론트엔드 소스 코드
│   ├── features/          # 기능별 컴포넌트
│   │   ├── auth/          # 인증 관련
│   │   ├── application/   # 지원서
│   │   ├── attendance/    # 출석 체크
│   │   └── admin/         # 관리자 패널
│   ├── shared/            # 공유 컴포넌트 및 유틸리티
│   └── App.tsx            # 메인 앱 컴포넌트
├── server/                # 백엔드 소스 코드
│   ├── src/              # Express 서버 코드
│   ├── prisma/           # Prisma 스키마 및 마이그레이션
│   └── temp-portal-ref/   # Python 포털 인증 스크립트
├── vercel.json            # Vercel 배포 설정
└── vite.config.ts         # Vite 빌드 설정
```

## 🎯 트랙 소개

멋쟁이사자처럼 수원대학교는 4개의 트랙으로 구성되어 있습니다:

- **Frontend**: React, TypeScript, UI/UX 개발
- **Backend**: Node.js, Database, API 개발
- **Design**: UI/UX 디자인, 프로토타이핑
- **PM**: 프로젝트 관리, 기획

## 🤝 기여하기

이 프로젝트는 멋쟁이사자처럼 수원대학교 14기 멤버들을 위한 프로젝트입니다. 기여를 원하시면 이슈를 생성하거나 Pull Request를 보내주세요.

### 브랜치 네이밍 컨벤션

새로운 브랜치를 생성할 때는 다음 컨벤션을 따라주세요:

- `feature/` - 새로운 기능 추가
  - 예: `feature/add-user-profile`, `feature/attendance-export`
- `fix/` - 버그 수정
  - 예: `fix/login-error`, `fix/attendance-session-bug`
- `hotfix/` - 긴급 수정 (프로덕션 버그)
  - 예: `hotfix/critical-auth-issue`
- `refactor/` - 코드 리팩토링
  - 예: `refactor/auth-context`, `refactor/api-routes`
- `docs/` - 문서 수정
  - 예: `docs/update-readme`, `docs/add-api-docs`
- `style/` - 코드 스타일 변경 (기능 변경 없음)
  - 예: `style/format-code`, `style/lint-fixes`
- `test/` - 테스트 추가/수정
  - 예: `test/add-auth-tests`, `test/coverage-improvement`

**예시:**
```bash
# 새로운 기능 브랜치 생성
git checkout -b feature/add-dark-mode

# 버그 수정 브랜치 생성
git checkout -b fix/portal-verification-error
```

### 커밋 메시지 컨벤션

커밋 메시지는 다음 형식을 따라주세요:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type (필수)
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 업무 수정, 패키지 매니저 설정 등
- `perf`: 성능 개선
- `ci`: CI/CD 설정 변경

#### Scope (선택)
- 변경된 범위를 명시 (예: `auth`, `attendance`, `admin`, `ui`)

#### Subject (필수)
- 변경 사항을 간결하게 설명 (50자 이내)
- 명령형으로 작성 (예: "추가" 대신 "Add")
- 첫 글자는 대문자로 시작하지 않음
- 마지막에 마침표(.) 사용하지 않음

#### Body (선택)
- 변경 사항의 상세 설명
- 왜 변경했는지, 어떻게 변경했는지 설명

#### Footer (선택)
- Breaking changes나 이슈 번호 참조

**예시:**
```bash
# 기능 추가
git commit -m "feat(auth): 포털 인증 기능 추가"

# 버그 수정
git commit -m "fix(attendance): 출석 세션 생성 오류 수정"

# 문서 수정
git commit -m "docs: README에 배포 가이드 추가"

# 리팩토링
git commit -m "refactor(api): 인증 미들웨어 구조 개선"

# 여러 줄 커밋 메시지
git commit -m "feat(admin): 세션 삭제 기능 추가

- 세션 삭제 API 엔드포인트 구현
- 관련 출석 기록도 함께 삭제되도록 처리
- 관리자 권한 검증 추가"
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 팀

멋쟁이사자처럼 수원대학교 14기 운영진 및 개발팀

---

Made with ❤️ by 멋쟁이사자처럼 수원대학교 14기

