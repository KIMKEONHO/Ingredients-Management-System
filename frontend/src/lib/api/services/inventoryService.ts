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
};
