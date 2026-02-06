#!/bin/sh
set -e

# Render의 PORT 환경 변수 사용 (없으면 기본값 80)
PORT=${PORT:-80}

# nginx 설정에서 포트를 동적으로 변경
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf

# 백엔드 시작
echo "Starting backend server..."
cd /app/server

# Prisma Client 생성 (런타임에서도 필요)
echo "Generating Prisma Client..."
npx prisma generate || {
    echo "ERROR: Failed to generate Prisma Client"
    exit 1
}

# 백엔드를 백그라운드에서 실행하고 출력을 로그 파일로 리다이렉트
# stdout과 stderr를 모두 로그 파일로 리다이렉트하고, 실시간으로도 출력
PORT=4000 node dist/app.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# 백엔드 로그를 실시간으로 모니터링하는 백그라운드 프로세스 시작
tail -f /tmp/backend.log &
TAIL_PID=$!

# 백엔드가 시작될 때까지 대기 (최대 30초)
echo "Waiting for backend to start..."
MAX_ATTEMPTS=30
ATTEMPT=0
BACKEND_READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    # 백엔드 프로세스가 여전히 실행 중인지 확인
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "ERROR: Backend process died!"
        echo "Backend logs:"
        cat /tmp/backend.log || true
        exit 1
    fi
    
    # Node.js를 사용하여 백엔드 헬스체크 (가장 확실한 방법)
    if node -e "require('http').get('http://localhost:4000/', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));" 2>/dev/null; then
        echo "Backend is ready!"
        BACKEND_READY=true
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    sleep 1
done

if [ "$BACKEND_READY" = false ]; then
    echo "ERROR: Backend failed to start within 30 seconds"
    echo "Backend logs:"
    cat /tmp/backend.log || true
    exit 1
fi

# nginx를 포그라운드에서 실행
echo "Starting nginx on port ${PORT}..."
exec nginx -g "daemon off;"
