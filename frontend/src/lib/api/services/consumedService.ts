import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// 스키마에서 가져온 타입 정의
export interface ConsumedLogResponseDto {
  categoryId?: number;
  categoryName?: string;
  totalConsumedQuantity?: number;
}

export interface MonthlyConsumedLogResponseDto {
  month?: number;
  monthName?: string;
  categoryId?: number;
  categoryName?: string;
  totalConsumedQuantity?: number;
}

export interface RsDataListConsumedLogResponseDto {
  resultCode?: string;
  msg?: string;
  data?: ConsumedLogResponseDto[];
}

export interface RsDataListMonthlyConsumedLogResponseDto {
  resultCode?: string;
  msg?: string;
  data?: MonthlyConsumedLogResponseDto[];
}

// 공통 응답 처리 타입
type ApiResponse<T> = RsDataListConsumedLogResponseDto | RsDataListMonthlyConsumedLogResponseDto | T[] | T;

// API 응답의 공통 필드를 위한 타입
interface ApiResponseBase {
  resultCode?: string;
  msg?: string;
  data?: unknown;
}

// 디버그 모드 확인
const isDebugMode = process.env.NODE_ENV === 'development';

export class ConsumedService {
  /**
   * 공통 응답 처리 함수
   * 다양한 API 응답 구조를 처리하여 일관된 배열 형태로 반환
   */
  private static processApiResponse<T>(
    response: ApiResponse<T>,
    endpoint: string,
    period: string
  ): T[] {
    const responseBase = response as ApiResponseBase;
    
    if (isDebugMode) {
      console.log(`[DEBUG] ${period} 사용량 API 응답 상세:`, {
        endpoint,
        resultCode: responseBase?.resultCode,
        msg: responseBase?.msg,
        data: responseBase?.data,
        dataType: typeof responseBase?.data,
        isArray: Array.isArray(responseBase?.data),
        fullResponse: response
      });
    }

    // 표준 응답 구조: { resultCode: 'S-1', data: [...] }
    if (responseBase?.resultCode === 'S-1' && responseBase?.data) {
      if (isDebugMode) {
        console.log(`[DEBUG] ${period} 사용량 데이터 성공 (resultCode S-1):`, responseBase.data);
      }
      return Array.isArray(responseBase.data) ? responseBase.data as T[] : [responseBase.data as T];
    }

    // data 필드가 있는 경우
    if (responseBase?.data) {
      if (isDebugMode) {
        console.log(`[DEBUG] ${period} 사용량 데이터 성공 (data 필드):`, responseBase.data);
      }
      return Array.isArray(responseBase.data) ? responseBase.data as T[] : [responseBase.data as T];
    }

    // 응답 자체가 배열인 경우
    if (Array.isArray(response)) {
      if (isDebugMode) {
        console.log(`[DEBUG] ${period} 사용량 데이터 성공 (직접 배열):`, response);
      }
      return response;
    }

    // 단일 객체인 경우 배열로 감싸서 반환
    if (response && typeof response === 'object') {
      if (isDebugMode) {
        console.log(`[DEBUG] ${period} 사용량 데이터 성공 (단일 객체):`, response);
      }
      return [response as T];
    }

    // 처리할 수 없는 응답 구조
    const errorMsg = responseBase?.msg || `${period} 사용량 데이터를 가져오는데 실패했습니다.`;
    if (isDebugMode) {
      console.error(`[DEBUG] ${period} 사용량 API 응답 실패:`, {
        resultCode: responseBase?.resultCode,
        msg: responseBase?.msg,
        data: responseBase?.data,
        fullResponse: response
      });
    }
    throw new Error(`${errorMsg} 응답: ${JSON.stringify(response)}`);
  }

  /**
   * 공통 API 호출 함수
   */
  private static async fetchConsumedData<T>(
    endpoint: string,
    period: string,
    responseType: 'ConsumedLog' | 'MonthlyConsumedLog'
  ): Promise<T[]> {
    try {
      if (isDebugMode) {
        console.log(`[DEBUG] ${period} 사용량 조회 시작, 엔드포인트:`, endpoint);
      }

      const response = await apiClient.get<ApiResponse<T>>(endpoint);
      
      if (isDebugMode) {
        console.log(`[DEBUG] ${period} 사용량 API 응답:`, response);
      }

      return this.processApiResponse<T>(response, endpoint, period);
    } catch (error) {
      console.error(`${period} 사용량 조회 실패:`, error);
      throw error;
    }
  }

  /**
   * 이번 주 식품 재고 사용량 조회
   */
  static async getThisWeekConsumedLog(): Promise<ConsumedLogResponseDto[]> {
    return this.fetchConsumedData<ConsumedLogResponseDto>(
      API_ENDPOINTS.CONSUMED.THIS_WEEK,
      '이번 주',
      'ConsumedLog'
    );
  }

  /**
   * 이번 달 식품 재고 사용량 조회
   */
  static async getThisMonthConsumedLog(): Promise<ConsumedLogResponseDto[]> {
    return this.fetchConsumedData<ConsumedLogResponseDto>(
      API_ENDPOINTS.CONSUMED.THIS_MONTH,
      '이번 달',
      'ConsumedLog'
    );
  }

  /**
   * 지난 3개월 식품 재고 사용량 조회
   */
  static async getLast3MonthsConsumedLog(): Promise<ConsumedLogResponseDto[]> {
    return this.fetchConsumedData<ConsumedLogResponseDto>(
      API_ENDPOINTS.CONSUMED.LAST_3_MONTHS,
      '지난 3개월',
      'ConsumedLog'
    );
  }

  /**
   * 올해 식품 재고 사용량 조회
   */
  static async getThisYearConsumedLog(): Promise<ConsumedLogResponseDto[]> {
    return this.fetchConsumedData<ConsumedLogResponseDto>(
      API_ENDPOINTS.CONSUMED.THIS_YEAR,
      '올해',
      'ConsumedLog'
    );
  }

  /**
   * 올해 월별 식품 재고 사용량 조회
   */
  static async getMonthlyConsumedLog(): Promise<MonthlyConsumedLogResponseDto[]> {
    return this.fetchConsumedData<MonthlyConsumedLogResponseDto>(
      API_ENDPOINTS.CONSUMED.MONTHLY,
      '월별',
      'MonthlyConsumedLog'
    );
  }

  /**
   * 기간별 사용량 데이터를 가져오는 통합 함수
   */
  static async getConsumedLogByPeriod(period: string): Promise<ConsumedLogResponseDto[]> {
    // 기간별 엔드포인트 매핑
    const periodEndpointMap: Record<string, string> = {
      '이번 주': API_ENDPOINTS.CONSUMED.THIS_WEEK,
      '이번 달': API_ENDPOINTS.CONSUMED.THIS_MONTH,
      '지난 3개월': API_ENDPOINTS.CONSUMED.LAST_3_MONTHS,
      '올해': API_ENDPOINTS.CONSUMED.THIS_YEAR,
    };

    const endpoint = periodEndpointMap[period];
    if (!endpoint) {
      throw new Error(`지원하지 않는 기간입니다: ${period}`);
    }

    try {
      return await this.fetchConsumedData<ConsumedLogResponseDto>(
        endpoint,
        period,
        'ConsumedLog'
      );
    } catch (error) {
      console.error(`[${period}] 사용량 데이터 조회 실패:`, error);
      // 에러 발생 시에도 페이지가 깨지지 않도록 빈 배열 반환
      return [];
    }
  }
}
