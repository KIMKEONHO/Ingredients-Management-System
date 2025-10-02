# 재료 관리 시스템 (Ingredients Management System) - 프론트엔드

## 개요

이 프로젝트는 재료 관리 시스템의 프론트엔드 애플리케이션입니다. Next.js 14와 React를 기반으로 구축되었으며, 일반 사용자와 관리자를 위한 분리된 인증 시스템을 제공합니다.

## 주요 기능

### 🔐 인증 시스템
- **일반 사용자 로그인**: `/login` - 일반 사용자용 로그인
- **관리자 로그인**: `/admin/login` - 관리자 전용 로그인
- **역할 기반 접근 제어 (RBAC)**: 사용자 역할에 따른 페이지 접근 제한
- **자동 리다이렉션**: 권한이 없는 사용자는 적절한 페이지로 자동 이동

### 🛡️ 보안 기능
- **AdminGuard**: 관리자 페이지 보호를 위한 고차 컴포넌트
- **쿠키 기반 인증**: 백엔드에서 발급한 Access/Refresh Token 사용
- **권한 검증**: 클라이언트와 서버 양쪽에서 권한 확인

### 📱 사용자 인터페이스
- **반응형 디자인**: Tailwind CSS를 활용한 모던한 UI
- **직관적인 네비게이션**: 사용자 역할에 따른 메뉴 표시
- **로딩 상태 표시**: 사용자 경험 향상을 위한 로딩 인디케이터

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand (useGlobalLoginMember)
- **HTTP 클라이언트**: Axios
- **라우팅**: Next.js App Router

## 프로젝트 구조

```
src/
├── app/
│   ├── admin/                 # 관리자 전용 페이지
│   │   ├── login/            # 관리자 로그인
│   │   ├── statistics/       # 통계 대시보드
│   │   ├── user/             # 사용자 관리
│   │   ├── complaints/       # 불만사항 관리
│   │   └── components/       # 관리자 공통 컴포넌트
│   ├── login/                # 일반 사용자 로그인
│   ├── access-denied/        # 접근 거부 페이지
│   └── stores/               # 전역 상태 관리
├── lib/
│   ├── api/                  # API 관련
│   │   ├── client.ts         # HTTP 클라이언트 설정
│   │   ├── endpoints.ts      # API 엔드포인트 정의
│   │   └── services/         # API 서비스
│   ├── auth/                 # 인증 관련
│   │   └── adminGuard.tsx    # 관리자 권한 가드
│   └── constants/            # 상수 정의
```

## 백엔드 연동

### API 엔드포인트

#### 일반 사용자 인증
- `POST /users/login` - 일반 사용자 로그인
- `POST /auth/logout` - 로그아웃
- `GET /users/me` - 현재 사용자 정보 조회

#### 관리자 인증
- `POST /admin/login` - 관리자 로그인
- `POST /auth/logout` - 로그아웃 (공통)
- `GET /users/me` - 현재 사용자 정보 조회 (공통)

### 응답 형식

백엔드는 다음과 같은 `RsData` 형식으로 응답합니다:

```json
{
  "resultCode": "200",
  "msg": "로그인하였습니다.",
  "data": "accessToken"
}
```

## 사용 방법

### 1. 개발 서버 실행

```bash
npm install
npm run dev
```

### 2. 관리자 로그인

1. `/admin/login` 페이지로 이동
2. 관리자 계정 정보 입력
3. 로그인 성공 시 `/admin/statistics`로 자동 이동

### 3. 일반 사용자 로그인

1. `/login` 페이지로 이동
2. 사용자 계정 정보 입력
3. 로그인 성공 시 홈페이지로 이동

## 보안 아키텍처

### 권한 검증 흐름

1. **로그인 시도**: 사용자가 로그인 폼 제출
2. **백엔드 검증**: 서버에서 사용자 인증 및 권한 확인
3. **토큰 발급**: 인증 성공 시 Access/Refresh Token을 쿠키에 설정
4. **프론트엔드 검증**: AdminGuard에서 사용자 역할 재확인
5. **페이지 접근**: 권한이 있는 경우에만 페이지 렌더링

### AdminGuard 동작 방식

```typescript
// 관리자 권한 확인
const userRoles = loginMember.roles || [];
const isAdmin = userRoles.some((role: string) =>
  role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'admin'
);

if (!isAdmin) {
  router.push('/access-denied');
  return;
}
```

## 주요 컴포넌트

### AdminGuard

관리자 페이지를 보호하는 고차 컴포넌트입니다.

```typescript
import AdminGuard from '@/lib/auth/adminGuard';

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}
```

### AuthService

백엔드 인증 API와 통신하는 서비스 클래스입니다.

```typescript
// 일반 사용자 로그인
const result = await AuthService.login({ email, password });

// 관리자 로그인
const result = await AuthService.adminLogin({ email, password });
```

## 환경 설정

### 환경 변수

`.env.local` 파일에 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_VERSION=v1
```

## 배포

### Vercel 배포

```bash
npm run build
npm run start
```

### Docker 배포

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 문제 해결

### 일반적인 문제들

1. **로그인 실패**: 백엔드 서버 상태 및 네트워크 연결 확인
2. **권한 오류**: 사용자 역할 설정 및 AdminGuard 동작 확인
3. **API 오류**: 엔드포인트 URL 및 백엔드 응답 형식 확인

### 디버깅

브라우저 개발자 도구에서 다음을 확인하세요:

- Network 탭: API 요청/응답 상태
- Console 탭: JavaScript 오류 및 로그
- Application 탭: 쿠키 및 로컬 스토리지 상태

## 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 연락처

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.
