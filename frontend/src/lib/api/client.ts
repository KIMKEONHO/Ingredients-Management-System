import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';

class ApiClient {
  private client: ReturnType<typeof axios.create>;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL, // API_VERSION 제거 (userService에서 이미 포함)
      timeout: 10000,
      withCredentials: true, // 쿠키 포함 (Spring Security 세션용)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터 추가 (디버깅용)
    this.client.interceptors.request.use(
      (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('API 요청:', {
          method: config.method?.toUpperCase(),
          baseURL: config.baseURL,
          url: config.url,
          fullUrl: fullUrl,
          headers: config.headers,
          withCredentials: config.withCredentials
        });
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // 401 Unauthorized 에러 처리
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401) {
          this.handleUnauthorized();
        }
        // 403 Forbidden 에러 처리
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 403) {
          this.handleForbidden();
        }
        // 500 Internal Server Error 처리
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 500) {
          this.handleInternalServerError();
        }
        return Promise.reject(error);
      }
    );
  }

  // GET 요청
  async get<T>(url: string, config?: Parameters<typeof this.client.get>[1]): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // POST 요청
  async post<T>(url: string, data?: unknown, config?: Parameters<typeof this.client.post>[2]): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // PUT 요청
  async put<T>(url: string, data?: unknown, config?: Parameters<typeof this.client.put>[2]): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // DELETE 요청
  async delete<T>(url: string, config?: Parameters<typeof this.client.delete>[1]): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // PATCH 요청
  async patch<T>(url: string, data?: unknown, config?: Parameters<typeof this.client.patch>[2]): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // 401 에러 처리 (인증 실패)
  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  }

  // 403 에러 처리 (권한 없음)
  private handleForbidden(): void {
    // 403 에러는 자동으로 리다이렉트하지 않고, 컴포넌트에서 처리하도록 함
    console.warn('접근 권한이 없습니다. (403 Forbidden)');
  }

  // 500 에러 처리 (서버 내부 오류)
  private handleInternalServerError(): void {
    // 500 에러는 자동으로 리다이렉트하지 않고, 컴포넌트에서 처리하도록 함
    console.error('서버 내부 오류가 발생했습니다. (500 Internal Server Error)');
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 타입 정의
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
