import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { components } from '@/lib/backend/apiV1/schema';

export type FoodInventory = components['schemas']['FoodInventoryResponseDto'];
export type CreateFoodInventoryRequest = components['schemas']['CreateFoodInventoryRequestDto'];

export const inventoryService = {
  getInventory: async (): Promise<FoodInventory[]> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.MY);
    return response.data;
  },

  createInventoryItem: async (data: CreateFoodInventoryRequest): Promise<FoodInventory> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.BASE, data);
    return response.data;
  },
};
