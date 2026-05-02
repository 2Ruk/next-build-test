# Kanban Board 배포 가이드

## AWS Linux (EC2) 설치

### Node.js 설치 (Amazon Linux 2023)

```bash
# 시스템 업데이트
sudo dnf update -y

# Node.js 설치 (dnf 기본 제공 버전)
sudo dnf install -y nodejs

# 버전 확인
node -v
npm -v
```

> dnf 기본 버전이 낮을 경우, 아래 방법으로 Node.js 24 LTS를 설치하세요.

```bash
# NodeSource 저장소 추가 후 Node.js 24 LTS 설치
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
sudo dnf install -y nodejs

node -v
```

### Git 설치 & 프로젝트 클론

```bash
sudo dnf install -y git

git clone https://github.com/2Ruk/next-build-test.git
cd next-build-test
```

### 빌드 & 실행

```bash
# 의존성 설치
npm install

# API URL 설정 (백엔드 주소에 맞게 변경)
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# 빌드
npm run build

# 실행 (백그라운드)
nohup npm start > app.log 2>&1 &

# 로그 확인
tail -f app.log
```

### 포트 열기 (보안 그룹)

EC2 콘솔에서 인바운드 규칙에 **TCP 3000** 포트를 추가하세요.

이후 `http://<EC2-퍼블릭-IP>:3000` 으로 접속 가능합니다.

---

## 사전 요구사항

- Node.js 24+ (LTS)
- npm

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (기본 API: http://localhost:8080/api)
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

> Backend는 별도로 `localhost:8080`에 띄워야 합니다.

## API URL 변경

### 방법 1: `.env.local` 수정

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

다른 서버를 사용하려면 URL만 변경:

```bash
NEXT_PUBLIC_API_URL=https://my-api-server.com/api
```

### 방법 2: 빌드 시 환경변수 지정

```bash
NEXT_PUBLIC_API_URL=https://my-api-server.com/api npm run build
```

> `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 **빌드 타임**에 번들에 포함됩니다.
> 빌드 후에는 변경할 수 없으므로, 반드시 빌드 전에 설정하세요.

## 프로덕션 빌드 & 실행

```bash
# 빌드
npm run build

# 실행 (기본 포트 3000)
npm start

# 포트 변경
PORT=8000 npm start
```

## 정적 빌드 (Static Export)

별도 Node.js 서버 없이 정적 파일로 배포하려면:

1. `next.config.ts` 수정:

```ts
const nextConfig: NextConfig = {
  output: "export",
};
```

2. 빌드:

```bash
npm run build
```

3. `out/` 디렉토리에 정적 파일이 생성됩니다. S3, CloudFront, Nginx 등에 배포 가능.

> 주의: Static Export 시 `[id]` 같은 동적 라우트는 `generateStaticParams`가 필요합니다.

## 빠른 참고

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (HMR) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |
