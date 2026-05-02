# Kanban Board 배포 가이드

## 사전 요구사항

- Node.js 18+
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
