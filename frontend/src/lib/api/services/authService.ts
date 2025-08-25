import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// 에러 응답 타입 정의
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Axios 에러 타입 정의
interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    nickname: string;
    email: string;
    roles: string[];
  };
}

export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  email: string;
  roles: string[];
  createDate: string;
  modifyDate: string;
}

export class AuthService {
  // 로그인
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // 쿠키는 자동으로 브라우저에 저장되므로 별도 처리 불필요
      return { success: true, data: response };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as AxiosError)?.response?.data?.message 
        : '로그인에 실패했습니다.';
      return { 
        success: false, 
        error: errorMessage || '로그인에 실패했습니다.' 
      };
    }
  }

  // 로그아웃
  static async logout(): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      // 쿠키는 백엔드에서 제거하므로 별도 처리 불필요
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as AxiosError)?.response?.data?.message 
        : '로그아웃에 실패했습니다.';
      return { 
        success: false, 
        error: errorMessage || '로그아웃에 실패했습니다.' 
      };
    }
  }

  // 현재 사용자 정보 가져오기
  static async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.get<UserProfile>(API_ENDPOINTS.AUTH.ME);
      return { success: true, data: response };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as AxiosError)?.response?.data?.message 
        : '사용자 정보를 가져올 수 없습니다.';
      return { 
        success: false, 
        error: errorMessage || '사용자 정보를 가져올 수 없습니다.' 
      };
    }
  }

  // 쿠키 존재 여부 확인 (간단한 방법)
  static hasAuthCookie(): boolean {
    if (typeof document === 'undefined') return false;
    
    // 쿠키에서 accessToken 확인 (더 정확한 방법)
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => 
      cookie.trim().startsWith('accessToken=')
    );
  }

  // 사용자 등록
  static async register(userData: {
    username: string;
    password: string;
    email: string;
    nickname: string;
  }): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as AxiosError)?.response?.data?.message 
        : '회원가입에 실패했습니다.';
      return { 
        success: false, 
        error: errorMessage || '회원가입에 실패했습니다.' 
      };
    }
  }
}
