import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export type FoodInventory = {
  foodInventoryId?: number;
  quantity?: number;
  unit?: string;
  boughtDate?: string;
  expirationDate?: string;
  place?: "REFRIGERATED" | "FROZEN" | "ROOM";
  userId?: number;
  ingredientId?: number;
  ingredientName?: string;
  status?: "NORMAL" | "EXPIRING_SOON" | "EXPIRED" | "CONSUMED";
};

export type CreateFoodInventoryRequest = {
  quantity?: number;
  unit?: string;
  boughtDate?: string;
  expirationDate?: string;
  place?: "REFRIGERATED" | "FROZEN" | "ROOM";
  ingredientId?: number;
};

export type UpdateFoodInventoryRequest = {
  foodInventoryId?: number;
  quantity?: number;
  unit?: string;
  boughtDate?: string;
  expirationDate?: string;
  place?: "REFRIGERATED" | "FROZEN" | "ROOM";
};

export type UpdateFoodInventoryQuantityRequest = {
  quantity?: number;
};

export type UpdateFoodInventoryStatusRequest = {
  status?: "NORMAL" | "EXPIRING_SOON" | "EXPIRED" | "CONSUMED";
};

export type RsDataListFoodInventoryResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: FoodInventory[];
};

export type RsDataFoodInventoryResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: FoodInventory;
};

// 소비 로그 통계 타입 (schema.d.ts 기반)
export type ConsumedLogResponseDto = {
  categoryId?: number;
  categoryName?: string;
  totalConsumedQuantity?: number;
};

export type RsDataListConsumedLogResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: ConsumedLogResponseDto[];
};

// 카테고리별 사용량 통계 타입 (프론트엔드용)
export type CategoryUsageStats = {
  categoryId: number;
  categoryName: string;
  totalUsage: number;
  percentage: number;
  color: string;
};

export const inventoryService = {
  getInventory: async (): Promise<FoodInventory[]> => {
    const response = await apiClient.get<RsDataListFoodInventoryResponseDto>(
      API_ENDPOINTS.INVENTORY.MY
    );
    return Array.isArray(response?.data) ? response.data : [];
  },

  createInventoryItem: async (data: CreateFoodInventoryRequest): Promise<FoodInventory> => {
    const response = await apiClient.post<RsDataFoodInventoryResponseDto>(
      API_ENDPOINTS.INVENTORY.BASE,
      data
    );
    return (response && response.data) ? response.data : {};
  },

  updateInventoryItem: async (data: UpdateFoodInventoryRequest): Promise<FoodInventory> => {
    const response = await apiClient.put<RsDataFoodInventoryResponseDto>(
      API_ENDPOINTS.INVENTORY.BASE,
      data
    );
    return (response && response.data) ? response.data : {};
  },

  updateFoodInventoryQuantity: async (foodInventoryId: number, data: UpdateFoodInventoryQuantityRequest): Promise<FoodInventory> => {
    const response = await apiClient.patch<RsDataFoodInventoryResponseDto>(
      `${API_ENDPOINTS.INVENTORY.BASE}${foodInventoryId}/quantity`,
      data
    );
    return (response && response.data) ? response.data : {};
  },

  updateFoodInventoryStatus: async (foodInventoryId: number, data: UpdateFoodInventoryStatusRequest): Promise<FoodInventory> => {
    const response = await apiClient.patch<RsDataFoodInventoryResponseDto>(
      `${API_ENDPOINTS.INVENTORY.BASE}${foodInventoryId}/status`,
      data
    );
    return (response && response.data) ? response.data : {};
  },

  deleteInventoryItem: async (foodInventoryId: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.INVENTORY.BASE}${foodInventoryId}`);
  },

  // 소비 로그 통계 조회 (카테고리별 소비량)
  getConsumedLogStatistics: async (): Promise<ConsumedLogResponseDto[]> => {
    try {
      const response = await apiClient.get<RsDataListConsumedLogResponseDto>(
        '/api/v1/consumedlog/'
      );
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('소비 로그 통계 조회 실패:', error);
      throw error;
    }
  },

  // 카테고리별 사용량 통계 조회 (ConsumedLogResponseDto 기반)
  getCategoryUsageStats: async (): Promise<CategoryUsageStats[]> => {
    try {
      // 소비 로그 데이터를 가져와서 카테고리별 통계 생성
      const consumedLogData = await inventoryService.getConsumedLogStatistics();
      
      if (consumedLogData.length === 0) {
        return [];
      }

      // 색상 배열 정의
      const colors = [
        'bg-blue-500',
        'bg-purple-500', 
        'bg-blue-400',
        'bg-purple-400',
        'bg-blue-300',
        'bg-green-500',
        'bg-orange-500',
        'bg-red-500'
      ];

      // 총 소비량 계산
      const totalConsumedQuantity = consumedLogData.reduce((sum, item) => sum + (item.totalConsumedQuantity || 0), 0);
      
      // 카테고리별 통계 데이터 생성
      const categoryStats: CategoryUsageStats[] = consumedLogData.map((item, index) => ({
        categoryId: item.categoryId || index + 1,
        categoryName: item.categoryName || '알 수 없음',
        totalUsage: item.totalConsumedQuantity || 0,
        percentage: totalConsumedQuantity > 0 ? ((item.totalConsumedQuantity || 0) / totalConsumedQuantity) * 100 : 0,
        color: colors[index % colors.length]
      }));

      return categoryStats.sort((a, b) => b.totalUsage - a.totalUsage);
    } catch (error) {
      console.error('카테고리별 사용량 통계 조회 실패:', error);
      throw error;
    }
  },
};
