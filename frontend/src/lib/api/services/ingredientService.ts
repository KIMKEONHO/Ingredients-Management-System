import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { components } from '@/lib/backend/apiV1/schema';

export type Ingredient = components['schemas']['IngredientResponseDto'];

export const ingredientService = {
  getAllIngredients: async (): Promise<Ingredient[]> => {
    const response = await apiClient.get<components['schemas']['RsDataListIngredientResponseDto']>(
      API_ENDPOINTS.INGREDIENT.BASE
    );
    return Array.isArray(response?.data) ? response.data : [];
  },
};
