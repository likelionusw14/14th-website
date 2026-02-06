# 통합 Dockerfile: 프론트엔드 + 백엔드

# ========== 백엔드 빌드 스테이지 ==========
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# OpenSSL 라이브러리 설치 (Prisma 엔진이 필요로 함)
RUN apk add --no-cache openssl libc6-compat

# 백엔드 의존성 설치
COPY server/package*.json ./
RUN npm ci

# 백엔드 소스 코드 복사 및 빌드
COPY server/ ./
# Prisma Client 생성 (빌드 전에 필요)
RUN npx prisma generate
RUN npm run build

# ========== 프론트엔드 빌드 스테이지 ==========
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# 프론트엔드 의존성 설치
COPY package*.json ./
RUN npm ci

# 프론트엔드 소스 코드 복사 및 빌드
COPY . .
# 프로덕션 빌드 시 VITE_API_URL을 빈 문자열로 설정하여 상대 경로 사용 (nginx 프록시 활용)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ========== 최종 스테이지: nginx + 백엔드 ==========
FROM nginx:alpine

# nginx 설정 파일 복사
COPY docker/nginx-unified.conf /etc/nginx/conf.d/default.conf

# 프론트엔드 빌드 결과 복사
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# 백엔드 파일 복사
COPY --from=backend-builder /app/server/dist /app/server/dist
COPY --from=backend-builder /app/server/node_modules /app/server/node_modules
COPY --from=backend-builder /app/server/package*.json /app/server/
COPY server/prisma /app/server/prisma

# Node.js 및 Prisma CLI 설치 (백엔드 실행용)
# OpenSSL 라이브러리 설치 (Prisma 엔진이 필요로 함)
RUN apk add --no-cache nodejs npm openssl libc6-compat
# Prisma CLI를 전역으로 설치 (런타임에서 prisma generate 실행용)
RUN npm install -g prisma@^5.22.0

# 포트 노출 (Render는 동적 PORT 사용)
EXPOSE 80
ENV PORT=80

# 백엔드와 nginx를 함께 실행하는 스크립트
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
