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
      msg?: string;
    };
  };
}

export interface LoginRequest {
  email: string;
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

// ValidUserResponseDto 타입 정의 (백엔드 응답 구조에 맞춤)
export interface ValidUserResponseDto {
  userId: number;
  email: string;
  name: string;
  profile: string;
}

export class AuthService {
  // 로그인
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<{ resultCode: string; msg: string; data: string }>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // 백엔드 RsData 응답 구조에 맞춰 처리
      if (response.resultCode === "200") {
        // 로그인 성공 후 사용자 정보를 가져오기 위해 getCurrentUser 호출
        const userResult = await this.getCurrentUser();
        
        if (userResult.success && userResult.data) {
          return { 
            success: true, 
            data: { 
              user: {
                id: userResult.data.userId,
                username: userResult.data.email, // email을 username으로 사용
                nickname: userResult.data.name, // name을 nickname으로 사용
                email: userResult.data.email,
                roles: ['USER'] // 기본 역할
              }
            } 
          };
        } else {
          // getCurrentUser 실패 시 기본 정보로 반환
          return { 
            success: true, 
            data: { 
              user: { 
                id: 1, // 임시 ID
                username: credentials.email, 
                nickname: credentials.email.split('@')[0], 
                email: credentials.email, 
                roles: ['USER'] 
              } 
            } 
          };
        }
      } else {
        return { success: false, error: response.msg || '로그인에 실패했습니다.' };
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as AxiosError)?.response?.data?.msg || (error as AxiosError)?.response?.data?.message
        : '로그인에 실패했습니다.';
      return { 
        success: false, 
        error: errorMessage || '로그인에 실패했습니다.' 
      };
    }
  }

  // 관리자 로그인
  static async adminLogin(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<{ resultCode: string; msg: string; data: string }>(API_ENDPOINTS.ADMIN.LOGIN, credentials);
      
      // 백엔드 RsData 응답 구조에 맞춰 처리
      if (response.resultCode === "200") {
        // 관리자 로그인 성공 시 바로 관리자 권한으로 사용자 정보 반환
        // getCurrentUser 호출 없이 credentials 정보로 사용자 객체 생성
        return { 
          success: true, 
          data: { 
            user: {
              id: Date.now(), // 임시 ID (백엔드에서 실제 ID를 반환하지 않는 경우)
              username: credentials.email,
              nickname: credentials.email.split('@')[0], // 이메일에서 닉네임 추출
              email: credentials.email,
              roles: ['ADMIN'] // 관리자 권한 명시적 설정
            }
          } 
        };
      } else {
        return { success: false, error: response.msg || '관리자 로그인에 실패했습니다.' };
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as AxiosError)?.response?.data?.msg || (error as AxiosError)?.response?.data?.message
        : '관리자 로그인에 실패했습니다.';
      return { 
        success: false, 
        error: errorMessage || '관리자 로그인에 실패했습니다.' 
      };
    }
  }

  // 로그아웃
  static async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      // 백엔드에서 쿠키를 제거하므로 별도 처리 불필요
      // 로컬 스토리지나 세션 스토리지의 사용자 정보도 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
      
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
  static async getCurrentUser(): Promise<ApiResponse<ValidUserResponseDto>> {
    try {
      const response = await apiClient.get<ValidUserResponseDto>(API_ENDPOINTS.AUTH.ME);
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
    
    // 쿠키에서 다양한 인증 토큰 확인
    const cookies = document.cookie.split(';');
    const hasAccessToken = cookies.some(cookie => 
      cookie.trim().startsWith('accessToken=') || 
      cookie.trim().startsWith('token=') ||
      cookie.trim().startsWith('auth=') ||
      cookie.trim().startsWith('JSESSIONID=')
    );
    
    // 로컬 스토리지에서 인증 정보 확인
    const hasAuthHeader = localStorage.getItem('authToken') || 
                         sessionStorage.getItem('authToken') ||
                         localStorage.getItem('isLoggedIn') === 'true';
    
    console.log('쿠키 확인:', { 
      hasAccessToken, 
      hasAuthHeader, 
      cookies: cookies.map(c => c.trim()),
      localStorage: {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        authToken: localStorage.getItem('authToken'),
        userData: localStorage.getItem('userData')
      }
    });
    
    return hasAccessToken || !!hasAuthHeader;
  }

  // 더 정확한 인증 상태 확인
  static async checkAuthStatus(): Promise<boolean> {
    try {
      // 환경변수가 없으면 기본값 사용
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
      
      const response = await fetch(`${baseUrl}/api/v1/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('백엔드 인증 상태 확인 결과:', response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      // 에러가 발생해도 로컬 스토리지에 로그인 정보가 있으면 true 반환
      if (typeof window !== 'undefined') {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = localStorage.getItem('userData');
        if (isLoggedIn && userData) {
          console.log('백엔드 연결 실패했지만 로컬 로그인 정보 존재, 인증 성공으로 처리');
          return true;
        }
      }
      return false;
    }
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
