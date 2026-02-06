# 백엔드 전용 Dockerfile

FROM node:20-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 포트 노출
EXPOSE 4000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=4000

# 애플리케이션 실행
CMD ["node", "dist/app.js"]
