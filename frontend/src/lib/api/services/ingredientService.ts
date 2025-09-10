import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export type Ingredient = {
  id?: number;
  name?: string;
  categoryName?: string;
  createdAt?: string;
};

export type RsDataListIngredientResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: Ingredient[];
};

export const ingredientService = {
  getAllIngredients: async (): Promise<Ingredient[]> => {
    const response = await apiClient.get<RsDataListIngredientResponseDto>(
      API_ENDPOINTS.INGREDIENT.BASE
    );
    return Array.isArray(response?.data) ? response.data : [];
  },
};
