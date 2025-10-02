# 🎨 색상 시스템 & 공통 컴포넌트 사용법

## 📋 개요

이 디렉토리는 IMS 프로젝트의 일관된 색상 시스템과 재사용 가능한 UI 컴포넌트를 제공합니다.

## 🎯 주요 파일

- `colors.ts` - 색상 상수 및 프리셋 정의
- `../components/ui/PageHeader.tsx` - 페이지 헤더 컴포넌트
- `../components/ui/SectionCard.tsx` - 섹션 카드 컴포넌트

## 🚀 빠른 시작

### 1. 색상 상수 사용

```typescript
import { COLORS, COLOR_PRESETS } from '@/lib/constants/colors';

// 개별 색상 사용
<div className={`${COLORS.BACKGROUNDS.MAIN} ${COLORS.BORDERS.CARD}`}>
  내용
</div>

// 프리셋 사용
<div className={COLOR_PRESETS.STATISTICS_PAGE.background}>
  통계 페이지 내용
</div>
```

### 2. PageHeader 컴포넌트 사용

```typescript
import PageHeader from '@/app/components/ui/PageHeader';

// 기본 사용
<PageHeader 
  title="페이지 제목"
  description="페이지 설명"
/>

// variant 지정
<PageHeader 
  title="통계 페이지"
  description="데이터 분석"
  variant="statistics"
>
  {/* 추가 콘텐츠 (예: 시간 선택기) */}
  <TimeSelector />
</PageHeader>
```

### 3. SectionCard 컴포넌트 사용

```typescript
import SectionCard from '@/app/components/ui/SectionCard';

<SectionCard title="섹션 제목" variant="statistics">
  {/* 섹션 내용 */}
  <div>차트나 데이터 표시</div>
</SectionCard>
```

## 🎨 사용 가능한 Variant

- `main` - 메인 페이지 스타일
- `support` - 고객 지원 페이지 스타일  
- `statistics` - 통계 페이지 스타일
- `login` - 로그인 페이지 스타일
- `calendar` - 캘린더 페이지 스타일

## 🔧 새로운 페이지에 적용하기

### 1단계: 색상 프리셋 추가

```typescript
// colors.ts에 추가
export const COLOR_PRESETS = {
  // ... 기존 프리셋들
  
  NEW_PAGE: {
    background: COLORS.BACKGROUNDS.MAIN,
    header: COLORS.BACKGROUNDS.HEADER,
    card: COLORS.BACKGROUNDS.CARD,
    border: COLORS.BORDERS.SECTION,
  }
} as const;
```

### 2단계: 컴포넌트 사용

```typescript
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '@/app/components/ui/PageHeader';
import SectionCard from '@/app/components/ui/SectionCard';

export default function NewPage() {
  return (
    <div className={`min-h-screen ${COLOR_PRESETS.NEW_PAGE.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
          
          <PageHeader 
            title="새 페이지"
            description="페이지 설명"
            variant="main" // 또는 새로 만든 variant
          />
          
          <SectionCard title="섹션" variant="main">
            내용
          </SectionCard>
          
        </div>
      </div>
    </div>
  );
}
```

## 🎨 색상 팔레트

### 파란색 계열
- `blue-50` ~ `blue-900`: 연한 파란색부터 진한 파란색까지

### 보라색 계열  
- `purple-50` ~ `purple-900`: 연한 보라색부터 진한 보라색까지

### 그라데이션
- `from-blue-50 via-white to-purple-50`: 메인 배경
- `from-blue-600 to-purple-600`: 헤더 배경
- `from-blue-50 to-purple-50`: 카드 배경

## 📱 적용된 페이지들

### ✅ 완료된 페이지
1. **메인 페이지** (`/`) - 파란색-보라색 그라데이션
2. **통계 페이지** (`/statistics`) - 일관된 색상 시스템 적용
3. **고객 지원 페이지** (`/support`) - 파란색-보라색 그라데이션
4. **로그인 페이지** (`/login`) - 녹색에서 파란색으로 변경
6. **캘린더 페이지** (`/callender`) - 인디고에서 파란색으로 변경

### 🔄 적용 방법
각 페이지에서 다음과 같이 색상 프리셋을 사용:

```typescript
// 1. 색상 프리셋 import
import { COLOR_PRESETS } from '@/lib/constants/colors';

// 2. 배경 적용
<div className={`min-h-screen ${COLOR_PRESETS.CART_PAGE.background} p-6`}>

// 3. 카드 스타일 적용
<div className={`${COLOR_PRESETS.CART_PAGE.card} rounded-lg shadow-sm ${COLOR_PRESETS.CART_PAGE.border}`}>

// 4. 버튼 스타일 적용
<button className={`${COLOR_PRESETS.CART_PAGE.button} text-white rounded-lg`}>
```

## 💡 팁

1. **일관성 유지**: 새로운 색상을 추가할 때는 기존 색상과 조화를 고려하세요
2. **접근성**: 색상 대비가 충분한지 확인하세요
3. **재사용**: 자주 사용되는 색상 조합은 프리셋으로 만들어두세요
4. **테마**: 다크 모드 등 새로운 테마를 추가할 때도 이 구조를 활용하세요
5. **기존 페이지 수정**: 기존 페이지의 색상을 변경할 때는 해당 프리셋을 먼저 만들고 적용하세요

## 🔄 업데이트 내역

- 2024: 초기 색상 시스템 구축
- 2024: PageHeader, SectionCard 컴포넌트 추가
- 2024: 통계 페이지 리팩토링 완료
- 2024: 로그인, 캘린더 페이지 색상 통일 완료
- 2024: 모든 주요 페이지에 일관된 색상 시스템 적용
