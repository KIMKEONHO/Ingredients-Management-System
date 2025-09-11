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
    CHANGE_STATUS: '/api/v1/users/change/status', // 유저 상태 변경
    DELETE: '/api/v1/users/drop', // 유저 완전 삭제 (관리자용)
  },
    
    // 관리자 관련
    ADMIN: {
      BASE: '/admin',
      LOGIN: '/api/v1/users/admin/login',
      USERS: '/admin/users',
      STATISTICS: '/admin/statistics',
      COMPLAINTS: '/admin/complaints',
      USER_STATISTICS: '/api/v1/users/statistics', // 유저 통계 조회
    },
    
    // 재고 관련
    INVENTORY: {
      BASE: '/api/v1/inventory/',
      MY: '/api/v1/inventory/my',
      ITEMS: '/inventory/items',
      STOCK: '/inventory/stock',
      ORDERS: '/inventory/orders',
    },
    
    // 식단 관련
    DIET: {
      BASE: '/api/v1/diet',
      ADD: '/api/v1/diet/add', // 식단 추가
      PLANS: '/api/v1/diet/plans',
      CALENDAR: '/api/v1/diet/calendar',
      MONTHLY: '/api/v1/diet/:year/:month', // 월별 식단 조회
      ITEM: '/api/v1/diet/:id', // 개별 식단 항목 (수정/삭제)
      MONTH_STATISTICS: '/api/v1/diet/month/statistics', // 월간 칼로리 통계
      WEEK_STATISTICS: '/api/v1/diet/week/statistics', // 주간 칼로리 통계
    },

    // 민원 관련
    COMPLAINTS: {
      BASE: '/api/v1/complaints',
      ALL: '/api/v1/complaints/all', // 전체 민원 조회 (관리자)
      USERS: '/api/v1/complaints/users', // 내 민원 목록
      CREATE: '/api/v1/complaints/', // 민원 작성
      DETAIL: '/api/v1/complaints/:id', // 민원 상세 조회
      UPDATE: '/api/v1/complaints/:id', // 민원 수정
      DELETE: '/api/v1/complaints/:id', // 민원 삭제
      STATUS_UPDATE: '/api/v1/complaints/:id/status/:statusCode', // 민원 상태 변경 (관리자)
    },

    // 식재료 관련
    INGREDIENT: {
      BASE: '/api/v1/ingredient/',
      DETAIL: '/api/v1/ingredient/:ingredientId',
    },

    // 카테고리 관련
    CATEGORY: {
      BASE: '/api/v1/category/',
      DETAIL: '/api/v1/category/:categoryId',
    },

    // 피드백 관련
    FEEDBACK: {
      BASE: '/api/v1/feedback/',
      BY_COMPLAINT: '/api/v1/feedback/:complaintId', // 특정 민원의 피드백 조회/생성
      BY_ID: '/api/v1/feedback/:feedbackId', // 특정 피드백 수정/삭제
    },

  } as const;
  
  // API URL 생성 헬퍼 함수
  export const createApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
    if (!params) return endpoint;
    
    let url = endpoint;
    Object.entries(params).forEach(([key, value]) => {
      // undefined, null, 빈 문자열 체크
      if (value !== undefined && value !== null && value !== '') {
        url = url.replace(`:${key}`, String(value));
      } else {
        console.error(`createApiUrl: 파라미터 '${key}'가 유효하지 않습니다. 값:`, value);
        throw new Error(`파라미터 '${key}'가 유효하지 않습니다.`);
      }
    });
    
    return url;
  };