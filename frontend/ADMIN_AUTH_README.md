# 관리자 권한 시스템 구현

## 개요
이 프로젝트는 관리자 권한이 있는 사용자만 접근할 수 있는 관리자 페이지들을 보호하는 시스템을 구현했습니다.

## 구현된 기능

### 1. 관리자 로그인 페이지 (`/admin/login`)
- 관리자 전용 로그인 폼
- 일반 사용자와 구분된 UI
- 관리자 권한 검증 (ADMIN, ROLE_ADMIN, admin 역할 확인)
- 로그인 성공 시 관리자 대시보드로 자동 이동

### 2. 관리자 권한 가드 (`AdminGuard`)
- 모든 관리자 페이지에 적용되는 권한 체크 컴포넌트
- 로그인 상태 확인
- 관리자 역할 검증
- 권한이 없는 경우 접근 거부 페이지로 리다이렉트

### 3. 보호된 관리자 페이지들
- **통계 대시보드** (`/admin/statistics`) - AdminGuard 적용
- **사용자 관리** (`/admin/user/controll`) - AdminGuard 적용  
- **민원 관리** (`/admin/complaints`) - AdminGuard 적용

### 4. 접근 거부 페이지 (`/access-denied`)
- 권한이 없는 사용자를 위한 안내 페이지
- 일반 사용자 로그인과 관리자 로그인 링크 제공

### 5. 로그아웃 기능
- 관리자 사이드바에 로그아웃 버튼 추가
- 로그아웃 후 관리자 로그인 페이지로 리다이렉트

## 사용 방법

### 관리자 로그인
1. `/admin/login` 페이지 접속
2. 관리자 계정 정보 입력 (이메일/비밀번호)
3. 관리자 권한 확인 후 로그인 처리
4. 로그인 성공 시 `/admin/statistics`로 이동

### 일반 사용자 로그인
1. `/login` 페이지 접속
2. 일반 사용자 계정 정보 입력
3. 관리자 페이지 접근 시 권한 없음 메시지 표시

## 보안 특징

- **역할 기반 접근 제어 (RBAC)**: ADMIN, ROLE_ADMIN, admin 역할 확인
- **자동 리다이렉트**: 권한이 없는 경우 자동으로 적절한 페이지로 이동
- **세션 관리**: 로그인 상태와 사용자 정보를 전역 상태로 관리
- **쿠키 기반 인증**: 백엔드에서 발급한 토큰을 쿠키로 관리

## 백엔드 연동

### 로그인 API
```java
@PostMapping("/login")
public RsData<?> login(@RequestBody LoginRequestDto loginRequestDto, HttpServletResponse response) {
    // 1. 인증 처리
    User user = userService.login(loginRequestDto);
    
    // 2. Access/Refresh Token 발급 + 쿠키 설정
    String accessToken = tokenService.makeAuthCookies(user, response);
    
    // 3. 응답
    return new RsData<>("200", "로그인하였습니다.", accessToken);
}
```

### 사용자 역할 구조
```typescript
interface User {
  id: number;
  email: string;
  nickname: string;
  roles: string[]; // ['ADMIN', 'USER'] 등
}
```

## 파일 구조

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # 관리자 로그인 페이지
│   │   ├── statistics/page.tsx     # 통계 대시보드 (AdminGuard 적용)
│   │   ├── user/controll/page.tsx  # 사용자 관리 (AdminGuard 적용)
│   │   ├── complaints/page.tsx     # 민원 관리 (AdminGuard 적용)
│   │   └── components/sidebar.tsx  # 관리자 사이드바
│   ├── login/page.tsx              # 일반 사용자 로그인
│   └── access-denied/page.tsx      # 접근 거부 페이지
├── lib/
│   ├── auth/
│   │   └── adminGuard.tsx          # 관리자 권한 가드 컴포넌트
│   └── api/services/
│       └── authService.ts          # 인증 서비스
```

## 추가 개선 사항

1. **토큰 갱신**: Access Token 만료 시 자동 갱신 로직
2. **권한 세분화**: 더 세밀한 권한 레벨 관리
3. **감사 로그**: 관리자 활동 기록 및 모니터링
4. **2FA 인증**: 관리자 계정에 대한 2단계 인증
5. **세션 타임아웃**: 자동 로그아웃 및 세션 관리

## 테스트 방법

1. 일반 사용자로 로그인 후 관리자 페이지 접근 시도
2. 관리자 계정으로 로그인 후 관리자 페이지 접근 확인
3. 로그아웃 후 관리자 페이지 접근 시도
4. 권한이 없는 사용자의 접근 시도 시 적절한 리다이렉트 확인
