import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { components } from '@/lib/backend/apiV1/schema';

export type Ingredient = components['schemas']['IngredientResponseDto'];

export const ingredientService = {
  getAllIngredients: async (): Promise<Ingredient[]> => {
    const response = await apiClient.get(API_ENDPOINTS.INGREDIENT.BASE);

    console.log('식재료 목록:', response); // Added for debugging
    return response.data;
  },
};
