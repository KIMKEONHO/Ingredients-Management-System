import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

// 백엔드 응답 구조에 맞는 타입 정의
export interface BackendDietItem {
  id: number; // 백엔드에서 Long 타입으로 전송
  menu: string;
  kcal: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  date: string; // ISO 날짜 문자열
}

export interface BackendApiResponse<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export interface DietItem {
  id: number; // 백엔드에서 받은 실제 ID 사용
  name: string;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string; // YYYY-MM-DD 형식
}

export interface MonthlyDiet {
  [date: string]: {
    breakfast: DietItem[];
    lunch: DietItem[];
    dinner: DietItem[];
  };
}

// 백엔드 통계 DTO 구조에 맞는 인터페이스
export interface WeekStatisticsResponseDto {
  date: string; // yyyy-MM-dd 형식 (기존)
  averageKcal: number;
}

// 새로운 백엔드 DTO 구조
export interface NewWeekStatisticsResponseDto {
  date: string; // LocalDate -> yyyy-MM-dd 형식
  averageKcal: number;
}

export interface DietStatisticsResponseDto {
  averageKcal: number;
  diffFromLast: number | null; // 이전 기간 대비 차이
  diffRate: number | null; // 이전 기간 대비 변화율
}

// 기존 인터페이스 (호환성을 위해 유지)
export interface MonthStatisticsResponseDto {
  month: number;
  averageKcal: number;
  diffFromLast: number | null; // 지난달 대비 차이
  diffRate: number | null; // 지난달 대비 변화율
}

// 3개월 통계를 위한 인터페이스
export interface QuarterStatisticsResponseDto {
  averageKcal: number;
  totalKcal: number;
  diffFromPreviousQuarter: number | null; // 이전 분기 대비 차이
  diffRate: number | null; // 이전 분기 대비 변화율
  monthlyBreakdown: {
    month: number;
    averageKcal: number;
  }[];
}

// 연간 통계를 위한 인터페이스
export interface YearStatisticsResponseDto {
  averageKcal: number;
  totalKcal: number;
  diffFromLastYear: number | null; // 작년 대비 차이
  diffRate: number | null; // 작년 대비 변화율
  monthlyBreakdown: {
    month: number;
    averageKcal: number;
  }[];
}

export class DietService {
  /**
   * API 클라이언트가 준비되었는지 확인합니다.
   */
  private static isApiClientReady(): boolean {
    // apiClient가 존재하고 필요한 메서드들을 가지고 있는지 확인
    return !!(apiClient && typeof apiClient.get === 'function');
  }

  /**
   * API 요청 전 기본 검증을 수행합니다.
   */
  private static async validateBeforeRequest(): Promise<boolean> {
    if (!this.isApiClientReady()) {
      console.error('[DEBUG] API 클라이언트가 준비되지 않음');
      return false;
    }
    
    // 추가 검증 로직이 필요하다면 여기에 추가
    return true;
  }

  /**
   * 특정 연도와 월의 식단을 가져옵니다.
   * @param year 연도 (예: 2024)
   * @param month 월 (1-12)
   * @returns 해당 월의 식단 데이터
   */
  static async getMonthlyDiet(year: number, month: number): Promise<MonthlyDiet> {
    try {
      const url = createApiUrl(API_ENDPOINTS.DIET.MONTHLY, { year, month });
      console.log('[DEBUG] getMonthlyDiet 요청 URL:', url);
      
      const response = await apiClient.get<BackendApiResponse<BackendDietItem[]>>(url);
      console.log('[DEBUG] getMonthlyDiet 응답 전체:', response);
      
      // resultCode가 '200'인지 확인 (문자열)
      if (response.resultCode === '200' && response.data) {
        console.log('[DEBUG] getMonthlyDiet 성공, 데이터:', response.data);
        
        // 백엔드 배열 데이터를 프론트엔드 형식으로 변환
        const transformedData = this.transformBackendArrayToMonthlyDiet(response.data);
        console.log('[DEBUG] 변환된 데이터:', transformedData);
        
        return transformedData;
      }
      
      console.log('[DEBUG] getMonthlyDiet 실패 또는 데이터 없음:', response);
      return {};
    } catch (error) {
      console.error('월별 식단 조회 실패:', error);
      return {};
    }
  }

  /**
   * 백엔드 배열 데이터를 프론트엔드 MonthlyDiet 형식으로 변환
   */
  private static transformBackendArrayToMonthlyDiet(backendItems: BackendDietItem[]): MonthlyDiet {
    const monthlyDiet: MonthlyDiet = {};
    
    backendItems.forEach(item => {
      // ISO 날짜를 로컬 날짜로 변환하여 YYYY-MM-DD 형식으로 추출
      // 백엔드에서 LocalDateTime으로 저장되므로 UTC 변환 없이 직접 파싱
      const dateObj = new Date(item.date);
      const dateKey = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD 형식
      
      // mealType을 올바르게 매핑 (BREAKFAST -> breakfast, LUNCH -> lunch, DINNER -> dinner)
      let mealType: 'breakfast' | 'lunch' | 'dinner';
      switch (item.mealType) {
        case 'BREAKFAST':
          mealType = 'breakfast';
          break;
        case 'LUNCH':
          mealType = 'lunch';
          break;
        case 'DINNER':
          mealType = 'dinner';
          break;
        default:
          console.warn('알 수 없는 mealType:', item.mealType);
          return; // 건너뛰기
      }
      
      // 해당 날짜가 없으면 초기화
      if (!monthlyDiet[dateKey]) {
        monthlyDiet[dateKey] = {
          breakfast: [],
          lunch: [],
          dinner: []
        };
      }
      
      // DietItem 형식으로 변환하여 추가
      const dietItem: DietItem = {
        id: item.id, // 백엔드에서 받은 실제 ID 사용
        name: item.menu,
        calories: item.kcal,
        mealType: mealType,
        date: dateKey
      };
      
      monthlyDiet[dateKey][mealType].push(dietItem);
    });
    
    return monthlyDiet;
  }

  /**
   * 특정 날짜의 식단을 추가합니다.
   * @param date 날짜 (YYYY-MM-DD 형식)
   * @param mealType 식사 타입
   * @param name 메뉴명
   * @param calories 칼로리
   * @returns 추가된 식단 항목
   */
  static async addDietItem(
    date: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    name: string,
    calories: number
  ): Promise<DietItem | null> {
    try {
      // 백엔드 CreateDietRequestDto 형식에 맞춰 데이터 변환
      // 한국 시간대(UTC+9)를 고려하여 날짜 처리
      // date는 YYYY-MM-DD 형식이므로, 해당 날짜의 정오(12:00:00)를 의미
      
      // 방법 1: 한국 시간대를 명시적으로 설정
      const [year, month, day] = date.split('-').map(Number);
      const koreanDate = new Date(year, month - 1, day, 12, 0, 0); // 월은 0부터 시작하므로 -1
      
      // 방법 2: UTC 시간으로 계산하여 한국 시간 보장
      const utcDate = new Date(Date.UTC(year, month - 1, day, 3, 0, 0)); // UTC 03:00 = 한국 12:00
      
      console.log('[DEBUG] 원본 날짜:', date);
      console.log('[DEBUG] 방법1 - 한국 시간 기준:', koreanDate);
      console.log('[DEBUG] 방법2 - UTC 기준:', utcDate);
      console.log('[DEBUG] 방법1 ISO 문자열:', koreanDate.toISOString());
      console.log('[DEBUG] 방법2 ISO 문자열:', utcDate.toISOString());
      
      // 방법 2를 사용 (더 안전함)
      const finalDate = utcDate;
      
      // 백엔드에서 MealType.fromValue()로 소문자 값을 처리하므로 소문자 그대로 전송
      const requestData = {
        menu: name,
        kcal: calories,
        date: finalDate.toISOString(), // UTC 기준으로 계산된 한국 시간
        mealType: mealType // 소문자 그대로 전송 (breakfast, lunch, dinner)
      };
      
      console.log('[DEBUG] addDietItem 요청 데이터:', requestData);
      
      const response = await apiClient.post<BackendApiResponse<DietItem>>(API_ENDPOINTS.DIET.ADD, requestData);
      
      console.log('[DEBUG] addDietItem 전체 응답:', response);
      console.log('[DEBUG] 응답 resultCode:', response.resultCode);
      console.log('[DEBUG] 응답 data:', response.data);
      
      // 백엔드에서 201을 성공 코드로 사용하므로 200 또는 201을 성공으로 처리
      if ((response.resultCode === '200' || response.resultCode === '201') && response.msg) {
        console.log('[DEBUG] 식단 추가 성공:', response.msg);
        // data가 없으므로 임시 DietItem 객체 반환
        return {
          id: response.data?.id || Date.now(), // 백엔드에서 받은 실제 ID 사용, 없으면 임시 ID
          name: requestData.menu,
          calories: requestData.kcal,
          mealType: requestData.mealType === 'breakfast' ? 'breakfast' : 
                   requestData.mealType === 'lunch' ? 'lunch' : 'dinner',
          date: requestData.date.split('T')[0] // YYYY-MM-DD 형식
        };
      }
      
      console.log('[DEBUG] 응답이 성공이 아니거나 msg가 없음');
      return null;
    } catch (error) {
      console.error('식단 항목 추가 실패:', error);
      return null;
    }
  }

  /**
   * 식단 항목을 수정합니다.
   * @param id 식단 항목 ID
   * @param name 메뉴명
   * @param calories 칼로리
   * @param mealType 식사 타입 (기존 값 유지)
   * @param date 날짜 (기존 값 유지)
   * @returns 수정된 식단 항목
   */
  static async updateDietItem(
    id: number,
    name: string,
    calories: number,
    mealType?: 'breakfast' | 'lunch' | 'dinner',
    date?: string
  ): Promise<DietItem | null> {
    try {
      // 백엔드에서 @PathVariable을 사용하므로 URL 경로 파라미터로 전송
      const url = `${API_ENDPOINTS.DIET.BASE}/${id}`;
      
      // 백엔드 CreateDietRequestDto 형식에 맞춰 데이터 전송
      const requestData = {
        menu: name,
        kcal: calories,
        date: date ? new Date(date + 'T12:00:00').toISOString() : new Date().toISOString(),
        mealType: mealType || 'breakfast'
      };
      
      const response = await apiClient.patch<BackendApiResponse<DietItem>>(url, requestData);
      
      // 백엔드에서 204를 성공 코드로 사용
      if (response.resultCode === '204' && response.msg) {
        console.log('[DEBUG] 식단 수정 성공:', response.msg);
        // 수정된 데이터를 반환 (백엔드에서 data를 포함하지 않는 경우)
        return {
          id: id,
          name: name,
          calories: calories,
          mealType: mealType || 'breakfast',
          date: date || new Date().toLocaleDateString('en-CA')
        };
      }
      
      return null;
    } catch (error) {
      console.error('식단 항목 수정 실패:', error);
      return null;
    }
  }

  /**
   * 식단 항목을 삭제합니다.
   * @param id 식단 항목 ID
   * @returns 삭제 성공 여부
   */
  static async deleteDietItem(id: number): Promise<boolean> {
    try {
      // 백엔드에서 @PathVariable을 사용하므로 URL 경로 파라미터로 전송
      const url = `${API_ENDPOINTS.DIET.BASE}/${id}`;
      const response = await apiClient.delete<BackendApiResponse<void>>(url);
      
      // 백엔드에서 204를 성공 코드로 사용 (삭제는 보통 204 No Content)
      if (response.resultCode === '204') {
        console.log('[DEBUG] 식단 삭제 성공');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('식단 항목 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 월간 칼로리 통계를 가져옵니다. (새로운 API 사용)
   * @returns 월간 통계 데이터
   */
  static async getMonthStatistics(): Promise<DietStatisticsResponseDto | null> {
    try {
      console.log('[DEBUG] getMonthStatistics 요청 시작');
      
      // API 클라이언트 상태 검증
      if (!await this.validateBeforeRequest()) {
        console.log('[DEBUG] getMonthStatistics - API 클라이언트 검증 실패');
        return null;
      }
      
      const response = await apiClient.get<BackendApiResponse<DietStatisticsResponseDto>>(
        API_ENDPOINTS.DIET_STATISTICS.MONTH
      );
      
      console.log('[DEBUG] getMonthStatistics 응답:', response);
      
      if (response.resultCode === '200' && response.data) {
        console.log('[DEBUG] getMonthStatistics 성공:', response.data);
        return response.data;
      }
      
      console.log('[DEBUG] getMonthStatistics 실패 - resultCode:', response.resultCode);
      return null;
    } catch (error) {
      console.error('월간 통계 조회 실패:', error);
      return null;
    }
  }

  /**
   * 주간 칼로리 통계를 가져옵니다. (새로운 API 사용)
   * @returns 주간 통계 데이터
   */
  static async getWeekStatistics(): Promise<DietStatisticsResponseDto | null> {
    try {
      console.log('[DEBUG] getWeekStatistics 요청 시작');
      
      // API 클라이언트 상태 검증
      if (!await this.validateBeforeRequest()) {
        console.log('[DEBUG] getWeekStatistics - API 클라이언트 검증 실패');
        return null;
      }
      
      const response = await apiClient.get<BackendApiResponse<DietStatisticsResponseDto>>(
        API_ENDPOINTS.DIET_STATISTICS.WEEK
      );
      
      console.log('[DEBUG] getWeekStatistics 응답:', response);
      
      if (response.resultCode === '200' && response.data) {
        console.log('[DEBUG] getWeekStatistics 성공:', response.data);
        return response.data;
      }
      
      console.log('[DEBUG] getWeekStatistics 실패 - resultCode:', response.resultCode);
      return null;
    } catch (error) {
      console.error('주간 통계 조회 실패:', error);
      return null;
    }
  }

  /**
   * 주간 그래프 통계를 가져옵니다. (새로운 API 사용)
   * @returns 주간 그래프 통계 데이터 배열 (최근 7일)
   */
  static async getWeekGraphStatistics(): Promise<NewWeekStatisticsResponseDto[]> {
    try {
      console.log('[DEBUG] getWeekGraphStatistics 요청 시작');
      
      // API 클라이언트 상태 검증
      if (!await this.validateBeforeRequest()) {
        console.log('[DEBUG] getWeekGraphStatistics - API 클라이언트 검증 실패');
        return [];
      }
      
      const response = await apiClient.get<BackendApiResponse<NewWeekStatisticsResponseDto[]>>(
        API_ENDPOINTS.DIET_STATISTICS.WEEK_GRAPH
      );
      
      console.log('[DEBUG] getWeekGraphStatistics 응답:', response);
      
      if (response.resultCode === '200' && response.data) {
        console.log('[DEBUG] getWeekGraphStatistics 성공:', response.data);
        return response.data;
      }
      
      console.log('[DEBUG] getWeekGraphStatistics 실패 - resultCode:', response.resultCode);
      return [];
    } catch (error) {
      console.error('주간 그래프 통계 조회 실패:', error);
      return [];
    }
  }

  /**
   * 3개월 칼로리 통계를 가져옵니다. (새로운 API 사용)
   * @returns 3개월 통계 데이터
   */
  static async getQuarterStatistics(): Promise<DietStatisticsResponseDto | null> {
    try {
      console.log('[DEBUG] getQuarterStatistics 요청 시작');
      
      // API 클라이언트 상태 검증
      if (!await this.validateBeforeRequest()) {
        console.log('[DEBUG] getQuarterStatistics - API 클라이언트 검증 실패');
        return null;
      }
      
      const response = await apiClient.get<BackendApiResponse<DietStatisticsResponseDto>>(
        API_ENDPOINTS.DIET_STATISTICS.QUARTER
      );
      
      console.log('[DEBUG] getQuarterStatistics 응답:', response);
      
      if (response.resultCode === '200' && response.data) {
        console.log('[DEBUG] getQuarterStatistics 성공:', response.data);
        return response.data;
      }
      
      console.log('[DEBUG] getQuarterStatistics 실패 - resultCode:', response.resultCode);
      return null;
    } catch (error) {
      console.error('3개월 통계 조회 실패:', error);
      return null;
    }
  }

  /**
   * 연간 칼로리 통계를 가져옵니다. (새로운 API 사용)
   * @returns 연간 통계 데이터
   */
  static async getYearStatistics(): Promise<DietStatisticsResponseDto | null> {
    try {
      console.log('[DEBUG] getYearStatistics 요청 시작');
      
      // API 클라이언트 상태 검증
      if (!await this.validateBeforeRequest()) {
        console.log('[DEBUG] getYearStatistics - API 클라이언트 검증 실패');
        return null;
      }
      
      const response = await apiClient.get<BackendApiResponse<DietStatisticsResponseDto>>(
        API_ENDPOINTS.DIET_STATISTICS.YEAR
      );
      
      console.log('[DEBUG] getYearStatistics 응답:', response);
      
      if (response.resultCode === '200' && response.data) {
        console.log('[DEBUG] getYearStatistics 성공:', response.data);
        return response.data;
      }
      
      console.log('[DEBUG] getYearStatistics 실패 - resultCode:', response.resultCode);
      return null;
    } catch (error) {
      console.error('연간 통계 조회 실패:', error);
      return null;
    }
  }

}
