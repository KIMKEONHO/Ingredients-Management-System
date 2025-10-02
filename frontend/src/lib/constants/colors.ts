// 공통 색상 상수 정의
export const COLORS = {
  // 메인 색상
  PRIMARY: {
    BLUE: {
      50: 'from-blue-50',
      100: 'to-blue-100',
      200: 'border-blue-200',
      300: 'border-blue-300',
      400: 'bg-blue-400',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      800: 'text-blue-800',
      900: 'text-blue-900',
    },
    PURPLE: {
      50: 'from-purple-50',
      100: 'to-purple-100',
      200: 'border-purple-200',
      300: 'border-purple-300',
      400: 'bg-purple-400',
      500: 'bg-purple-500',
      600: 'bg-purple-600',
      700: 'text-purple-700',
      800: 'text-purple-800',
      900: 'text-purple-900',
    }
  },

  // 배경 그라데이션
  BACKGROUNDS: {
    MAIN: 'bg-gradient-to-b from-blue-50 via-white to-purple-50',
    HEADER: 'bg-gradient-to-r from-blue-600 to-purple-600',
    CARD: 'bg-gradient-to-r from-blue-50 to-purple-50',
    CHART: 'bg-gradient-to-b from-blue-50 to-purple-50',
    CHART_CIRCLE: 'bg-gradient-to-br from-blue-100 to-purple-100',
    BAR: 'bg-gradient-to-t from-blue-500 to-purple-500',
  },

  // 테두리
  BORDERS: {
    CARD: 'border border-blue-100',
    SECTION: 'border border-blue-200',
    INPUT: 'border-blue-200',
    HOVER: 'hover:border-blue-300',
  },

  // 텍스트
  TEXT: {
    PRIMARY: 'text-gray-900',
    SECONDARY: 'text-gray-600',
    WHITE: 'text-white',
    BLUE: 'text-blue-600',
    PURPLE: 'text-purple-600',
    BLUE_LIGHT: 'text-blue-100',
  },

  // 호버 효과
  HOVER: {
    CARD: 'hover:shadow-md hover:border-blue-300',
    BUTTON: 'hover:bg-blue-700',
    TEXT: 'hover:text-blue-700',
  }
} as const;

// 색상 조합 프리셋
export const COLOR_PRESETS = {
  // 메인 페이지 스타일
  MAIN_PAGE: {
    background: COLORS.BACKGROUNDS.MAIN,
    header: COLORS.BACKGROUNDS.HEADER,
    card: COLORS.BACKGROUNDS.CARD,
    border: COLORS.BORDERS.CARD,
  },

  // 고객 지원 페이지 스타일
  SUPPORT_PAGE: {
    background: 'bg-gray-50',
    header: COLORS.BACKGROUNDS.HEADER,
    card: 'bg-white',
    border: 'border-gray-200',
  },

  // 통계 페이지 스타일
  STATISTICS_PAGE: {
    background: COLORS.BACKGROUNDS.MAIN,
    header: COLORS.BACKGROUNDS.HEADER,
    card: COLORS.BACKGROUNDS.CARD,
    border: COLORS.BORDERS.SECTION,
  },


  // 로그인 페이지 스타일
  LOGIN_PAGE: {
    background: COLORS.BACKGROUNDS.MAIN,
    card: 'bg-white',
    border: 'border-blue-100',
    accent: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    focus: 'focus:ring-blue-500 focus:border-blue-500',
    hover: 'hover:text-blue-700',
  },

  // 캘린더 페이지 스타일
  CALENDAR_PAGE: {
    background: COLORS.BACKGROUNDS.MAIN,
    header: 'bg-white',
    card: 'bg-white',
    border: 'border-blue-100',
    accent: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    today: 'bg-blue-100 text-blue-800',
    selected: 'bg-blue-500 text-white',
    hover: 'hover:bg-blue-50',
  }
} as const;
