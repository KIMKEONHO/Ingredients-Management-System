# 전반 코드 리뷰 (2026-02-19)

## 범위
- Backend: Spring Boot API 보안/구조/유지보수성
- Frontend: Next.js 인증/네트워크 레이어 안정성

## 핵심 이슈 요약

### 1) [Critical] 기본 SecurityFilterChain에서 `anyRequest().permitAll()` 설정
- `SecurityConfig`에서 모든 요청 허용이 설정되어 있어, `/api/**` 외 경로(또는 향후 추가되는 경로)가 의도치 않게 공개될 위험이 큽니다.
- 멀티 `SecurityFilterChain` 구조에서는 **fallback 체인**을 최소 권한 정책으로 두는 것이 안전합니다.
- 권장: fallback 체인 기본값을 `authenticated()`로 두고, 허용 대상만 명시적으로 `permitAll()` 처리.

### 2) [High] API 클라이언트에서 요청/헤더를 상시 콘솔 로깅
- 프론트 API 인터셉터가 요청 메서드/URL/헤더를 매 요청마다 출력합니다.
- 프로덕션 브라우저 콘솔에 인증 관련 헤더/세션 정보가 노출될 수 있어 보안 및 개인정보 관점에서 리스크가 있습니다.
- 권장: `NODE_ENV !== 'production'` 조건부 로깅 또는 민감 헤더 마스킹.

### 3) [High] AuthGuard가 localStorage의 `isLoggedIn`/`userData`를 신뢰
- `AuthGuard`에서 localStorage 값만으로 인증 성공 처리합니다.
- localStorage는 클라이언트에서 임의 조작 가능하므로, 서버 검증 없이 권한 화면을 노출할 수 있습니다(특히 관리자 접근 UI).
- 권장: localStorage는 UX 힌트로만 사용하고, 실제 인증/인가 판정은 `/users/me` 같은 서버 확인 결과를 단일 신뢰원으로 사용.

### 4) [Medium] API 보안 규칙 유지보수 리스크(장문 매처 나열)
- `ApiSecurityConfig`에서 방대한 URL/Method 매핑을 단일 메서드에 나열하고 있어, 신규 엔드포인트 추가 시 누락/중복/순서 의존 버그 가능성이 큽니다.
- 권장: 도메인별 Security 설정 분리(예: inventory, admin, recipe) 또는 공통 prefix/role policy를 묶는 헬퍼 도입.

### 5) [Medium] 패키지 네이밍 일관성 문제 (`consumedlog/Service`)
- `domain/consumedlog/Service`처럼 대문자 폴더/패키지가 사용되어 Java 표준 네이밍 컨벤션(소문자 패키지)과 충돌합니다.
- 빌드 자체는 가능하지만, OS/도구/리팩토링 과정에서 혼선이 생길 수 있습니다.
- 권장: `service`(소문자)로 정리하고 import 경로 통일.

### 6) [Low] 미사용 변수/코드 흔적
- `ConsumedLogService#get3MonthConsumedLogStat`에서 계산한 일부 변수(`twoMonthsAgoStart`, `twoMonthsAgoEnd`, `threeMonthsAgoEnd`)가 실제 쿼리에 사용되지 않습니다.
- 기능 영향은 작지만, 유지보수 시 오해를 유발하고 코드 신뢰도를 낮춥니다.
- 권장: 미사용 변수 제거 후 의도 주석 보강.

## 권장 우선순위 (다음 액션)
1. **보안 긴급 조치**: fallback security 정책 `permitAll` 제거.
2. **인증 신뢰원 단일화**: localStorage 기반 인증 통과 로직 정비.
3. **운영 로깅 정리**: API 인터셉터 로깅 레벨/환경 분기 적용.
4. **보안 규칙 구조화**: API 권한 매핑을 도메인별로 분리.
5. **코드베이스 정리**: 패키지명/미사용 변수 정리.

## 참고 파일
- `backend/src/main/java/com/example/ingredients_ms/config/SecurityConfig.java`
- `backend/src/main/java/com/example/ingredients_ms/config/ApiSecurityConfig.java`
- `backend/src/main/java/com/example/ingredients_ms/domain/consumedlog/Service/ConsumedLogService.java`
- `frontend/src/lib/api/client.ts`
- `frontend/src/lib/auth/authGuard.tsx`
