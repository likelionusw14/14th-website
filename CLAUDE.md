# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

멋쟁이사자처럼 수원대학교 14기 통합 관리 시스템. Full-stack monorepo with React frontend at root and Express backend in `server/`.

## Commands

### Frontend (root)
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # tsc -b && vite build → dist/
npm run lint         # ESLint
```

### Backend (server/)
```bash
cd server
npm run dev          # ts-node dev server (port 4000)
npm run build        # tsc → dist/
npm start            # node dist/app.js
npm run create-admin # Create admin user
```

### Type checking
```bash
npx tsc --noEmit --project tsconfig.app.json   # Frontend
cd server && npx tsc --noEmit                    # Backend
```

### Database (server/)
```bash
npx prisma migrate dev    # Run migrations
npx prisma studio         # Visual DB explorer
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Framer Motion + React Router 7 + React Hook Form + shadcn/ui
- **Backend**: Express 5 + TypeScript + Prisma 5 + PostgreSQL + JWT + bcrypt
- **Portal Auth**: Python scraper (`server/temp-portal-ref/`) called via Node child process (`server/src/utils/portalScraperPython.ts`)

### Key Directories
- `src/features/` — Feature-based modules (auth, application, admin, attendance, profile, etc.)
- `src/shared/` — AuthContext, Layout, UI components
- `server/src/auth/` — Auth routes (verify, login, register, activate, reset-password, relink-portal)
- `server/src/application/` — Application CRUD, interview settings, Google Sheets import, duplicate detection, merge
- `server/src/member/` — Profile management, GCS image upload
- `server/src/attendance/` — Session creation, check-in, Excel export
- `server/prisma/schema.prisma` — Database schema

### Auth Flow
1. Portal verification → Python scraper extracts name/major from Suwon University portal
2. Registration creates user with hashed password, role=GUEST
3. Admin approval (INTERVIEW_APPROVED) promotes to BABY_LION
4. Final passers activate via `/login?mode=activate` to replace ADMIN_CREATED_ temp studentId with real one
5. JWT tokens: 10min for verification, 7 days for session

### Roles
- `GUEST` — Registered, not yet approved
- `BABY_LION` — Accepted member (아기사자)
- `ADMIN` — Operating staff (운영진)

### Middleware Pattern
`authenticateToken` and `requireAdmin` are defined locally in each route file (application.routes.ts, attendance.routes.ts, auth.routes.ts) — not shared.

### Frontend Auth
`useAuth()` hook from `src/shared/context/AuthContext.tsx`. `API_BASE_URL` exported from same file — uses `VITE_API_URL` env var or relative paths in production.

### Import Alias
`@/*` maps to `src/*` (frontend only, configured in tsconfig.app.json and vite.config.ts).

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000
```

### Backend (server/.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=4000
FRONTEND_URL=http://localhost:5173
GCS_BUCKET_NAME=...
GOOGLE_APPLICATION_CREDENTIALS=...
```

## Styling
Space theme with custom colors: `deep-navy`, `nebula-purple`, `comet-blue`, `starlight-white`, `lion-navy` (#003670), `lion-gold` (#E9B800). All forms use glass morphism (`glass` class), motion animations, and dark background.

## Conventions
- Korean language UI throughout
- Commit format: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Main branch: `main`, development on `develop`
- No test suite currently configured
