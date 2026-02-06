# Docker 설정

이 디렉토리에는 Docker 관련 파일들이 포함되어 있습니다.

## 파일 설명

- **Dockerfile**: 프론트엔드와 백엔드를 통합한 Docker 이미지
- **docker-compose.yml**: 로컬 개발 및 테스트용 docker-compose 설정
- **docker-entrypoint.sh**: 컨테이너 시작 시 백엔드와 nginx를 실행하는 스크립트
- **nginx-unified.conf**: 통합 서비스용 nginx 설정
- **frontend-nginx.conf**: 프론트엔드 전용 nginx 설정
- **frontend.Dockerfile**: 프론트엔드 전용 Dockerfile
- **server.Dockerfile**: 백엔드 전용 Dockerfile

## 사용 방법

### 로컬에서 빌드

프로젝트 루트에서:
```bash
docker build -t likelion-unified -f docker/Dockerfile .
```

### docker-compose 사용

```bash
cd docker
docker-compose up unified
```

### 이미지 내보내기

```bash
# 프로젝트 루트에서
.\scripts\build-and-export.ps1
```

생성된 tar 파일은 `docker/` 디렉토리에 저장됩니다.
