#!/bin/sh
set -e

# Render의 PORT 환경 변수 사용 (없으면 기본값 80)
PORT=${PORT:-80}

# nginx 설정에서 포트를 동적으로 변경
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf

# 백엔드를 백그라운드에서 실행
cd /app/server
PORT=4000 node dist/app.js &
BACKEND_PID=$!

# 백엔드가 시작될 때까지 대기
echo "Waiting for backend to start..."
sleep 3

# 백엔드 헬스체크
if ! wget --no-verbose --tries=1 --spider http://localhost:4000/ 2>/dev/null; then
    echo "Warning: Backend health check failed, but continuing..."
fi

# nginx를 포그라운드에서 실행
echo "Starting nginx on port ${PORT}..."
exec nginx -g "daemon off;"
