import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

export type Ingredient = {
  id?: number;
  name?: string;
  categoryName?: string;
  createdAt?: string;
};

export type CreateIngredientRequest = {
  name: string;
  categoryId: number;
};

export type UpdateIngredientRequest = {
  name: string;
  categoryId: number;
};

export type RsDataIngredientResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: Ingredient;
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

  createIngredient: async (ingredientData: CreateIngredientRequest): Promise<Ingredient> => {
    const response = await apiClient.post<RsDataIngredientResponseDto>(
      API_ENDPOINTS.INGREDIENT.BASE,
      ingredientData
    );
    return response?.data || {};
  },

  updateIngredient: async (id: number, ingredientData: UpdateIngredientRequest): Promise<Ingredient> => {
    try {
      // ID 유효성 검증
      if (!id || id <= 0) {
        throw new Error('유효하지 않은 식재료 ID입니다.');
      }

      const response = await apiClient.put<RsDataIngredientResponseDto>(
        createApiUrl(API_ENDPOINTS.INGREDIENT.DETAIL, { ingredientId: id }),
        ingredientData
      );
      return response?.data || {};
    } catch (error) {
      console.error('식재료 수정 API 오류:', error);
      throw error;
    }
  },

  deleteIngredient: async (id: number): Promise<void> => {
    // ID 유효성 검증
    if (!id || id <= 0) {
      throw new Error('유효하지 않은 식재료 ID입니다.');
    }

    await apiClient.delete(createApiUrl(API_ENDPOINTS.INGREDIENT.DETAIL, { ingredientId: id }));
  },
};
