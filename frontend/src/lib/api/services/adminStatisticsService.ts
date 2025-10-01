import { apiClient } from '../client';

export interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  activeUserGrowthRate: number;
  newUserGrowthRate: number;
  complaintRate: number;
  totalRecipes: number;
  recipeGrowthRate: number;
  totalIngredients: number;
  ingredientGrowthRate: number;
  totalComplaints: number;
  complaintGrowthRate: number;
  totalFeedback: number;
  feedbackGrowthRate: number;
  totalDietLogs: number;
  dietLogGrowthRate: number;
  totalInventoryItems: number;
  inventoryGrowthRate: number;
}

export interface ChartData {
  weeklyTrend: {
    day: string;
    activeUsers: number;
    newUsers: number;
    recipeRegistrations: number;
  }[];
  userStatusDistribution: {
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'WITHDRAWN';
    name: string;
    value: number;
    color: string;
  }[];
  dailyActivity: {
    date: string;
    logins: number;
    recipeViews: number;
    recipeRegistrations: number;
  }[];
}

export interface AdminStatisticsResponse {
  success: boolean;
  data?: AdminStatistics;
  message?: string;
}

export interface ChartDataResponse {
  success: boolean;
  data?: ChartData;
  message?: string;
}

export const adminStatisticsService = {
  // 관리자 통계 조회 (테마별)
  async getAdminStatistics(theme: string): Promise<AdminStatisticsResponse> {
    try {
      const response = await apiClient.get<{
        resultCode: string;
        msg: string;
        data: AdminStatistics;
      }>(`/api/v1/admin/statistics/${theme}`);
      
      console.log('관리자 통계 조회 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response && typeof response === 'object') {
        // RsData 형태: { resultCode: "200", msg: "theme 단위의 관리자 통계입니다.", data: {...} }
        if ('resultCode' in response && typeof response.resultCode === 'string') {
          const resultCode = response.resultCode;
          const message = response.msg || '관리자 통계를 성공적으로 불러왔습니다.';
          const data = response.data;
          
          // 200번대는 성공
          if (resultCode.startsWith('2')) {
            return {
              success: true,
              data: data,
              message: message
            };
          } else {
            return {
              success: false,
              message: message
            };
          }
        }
      }
      
      // 응답이 없는 경우
      return {
        success: false,
        message: '관리자 통계를 불러올 수 없습니다.'
      };
    } catch (error: unknown) {
      console.error('관리자 통계 조회 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        const status = errorResponse.response?.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      throw new Error('관리자 통계 정보를 불러올 수 없습니다.');
    }
  },

  // 차트 데이터 조회
  async getChartData(theme: string): Promise<ChartDataResponse> {
    try {
      const response = await apiClient.get<{
        resultCode: string;
        msg: string;
        data: ChartData;
      }>(`/api/v1/admin/charts/${theme}`);
      
      console.log('차트 데이터 조회 응답:', response);
      
      if (response && typeof response === 'object') {
        if ('resultCode' in response && typeof response.resultCode === 'string') {
          const resultCode = response.resultCode;
          const message = response.msg || '차트 데이터를 성공적으로 불러왔습니다.';
          const data = response.data;
          
          if (resultCode.startsWith('2')) {
            return {
              success: true,
              data: data,
              message: message
            };
          } else {
            return {
              success: false,
              message: message
            };
          }
        }
      }
      
      return {
        success: false,
        message: '차트 데이터를 불러올 수 없습니다.'
      };
    } catch (error: unknown) {
      console.error('차트 데이터 조회 실패:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        const status = errorResponse.response?.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      throw new Error('차트 데이터를 불러올 수 없습니다.');
    }
  }
};
