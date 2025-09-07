import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { components } from '@/lib/backend/apiV1/schema';

export type FoodInventory = components['schemas']['FoodInventoryResponseDto'];
export type CreateFoodInventoryRequest = components['schemas']['CreateFoodInventoryRequestDto'];
export type UpdateFoodInventoryRequest = components['schemas']['UpdateFoodInventoryRequestDto'];
export type UpdateFoodInventoryQuantityRequest = components['schemas']['UpdateFoodInventoryQuantityRequestDto'];
export type UpdateFoodInventoryStatusRequest = components['schemas']['UpdateFoodInventoryStatusRequestDto'];

export const inventoryService = {
  getInventory: async (): Promise<FoodInventory[]> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.MY);
    return response.data;
  },

  createInventoryItem: async (data: CreateFoodInventoryRequest): Promise<FoodInventory> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.BASE, data);
    return response.data;
  },

  updateInventoryItem: async (data: UpdateFoodInventoryRequest): Promise<FoodInventory> => {
    const response = await apiClient.put(API_ENDPOINTS.INVENTORY.BASE, data);
    return response.data;
  },

  updateFoodInventoryQuantity: async (foodInventoryId: number, data: UpdateFoodInventoryQuantityRequest): Promise<FoodInventory> => {
    const response = await apiClient.patch(`${API_ENDPOINTS.INVENTORY.BASE}${foodInventoryId}/quantity`, data);
    return response.data;
  },

  updateFoodInventoryStatus: async (foodInventoryId: number, data: UpdateFoodInventoryStatusRequest): Promise<FoodInventory> => {
    const response = await apiClient.patch(`${API_ENDPOINTS.INVENTORY.BASE}${foodInventoryId}/status`, data);
    return response.data;
  },

  deleteInventoryItem: async (foodInventoryId: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.INVENTORY.BASE}${foodInventoryId}`);
  },
};
