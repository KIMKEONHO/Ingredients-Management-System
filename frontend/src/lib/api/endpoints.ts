// API 엔드포인트 상수 정의
export const API_ENDPOINTS = {
    // 인증 관련
    AUTH: {
      LOGIN: '/api/v1/users/login',
      LOGOUT: '/api/v1/users/logout',
      ME: '/api/v1/users/me',
      REGISTER: '/auth/register',
    },
    
    // 사용자 관련
    USERS: {
      BASE: '/api/v1/users',
      PROFILE: '/api/v1/users/profile',
      UPDATE: '/api/v1/users/update',
    },
    
    // 관리자 관련
    ADMIN: {
      BASE: '/admin',
      LOGIN: '/api/v1/users/admin/login',
      USERS: '/admin/users',
      STATISTICS: '/admin/statistics',
      COMPLAINTS: '/admin/complaints',
    },
    
    // 재고 관련
    INVENTORY: {
      BASE: '/inventory/',
      MY: '/inventory/my',
      ITEMS: '/inventory/items',
      STOCK: '/inventory/stock',
      ORDERS: '/inventory/orders',
    },
    
    // 식단 관련
    DIET: {
      BASE: '/diet',
      ADD: '/diet/add', // 식단 추가
      PLANS: '/diet/plans',
      CALENDAR: '/diet/calendar',
      MONTHLY: '/diet/:year/:month', // 월별 식단 조회
      ITEM: '/diet/:id', // 개별 식단 항목 (수정/삭제)
      MONTH_STATISTICS: '/diet/month/statistics', // 월간 칼로리 통계
      WEEK_STATISTICS: '/diet/week/statistics', // 주간 칼로리 통계
    },

    // 식재료 관련
    INGREDIENT: {
      BASE: '/ingredient/',
    },

  } as const;
  
  // API URL 생성 헬퍼 함수
  export const createApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
    if (!params) return endpoint;
    
    let url = endpoint;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
    
    return url;
  };