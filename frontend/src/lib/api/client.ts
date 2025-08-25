import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
const API_VERSION = '/api/v1';

class ApiClient {
  private client: ReturnType<typeof axios.create>;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      timeout: 10000,
      withCredentials: true, // 쿠키 포함 (Spring Security 세션용)
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
    if (typeof window !== 'undefined') {
      // 접근 권한이 없다는 페이지로 리다이렉트
      window.location.href = '/access-denied';
    }
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
