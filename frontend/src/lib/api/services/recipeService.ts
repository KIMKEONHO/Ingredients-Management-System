import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// 레시피 재료 타입
export type CreateRecipeIngredientsRequestDto = {
  ingredientId: number;
  quantity: number;
  unit: string;
  notes?: string;
};

// 레시피 단계 타입
export type CreateRecipeStepRequestDto = {
  stepNumber: number;
  cookingTime: number;
  imageUrl?: string;
  description: string;
};

// 레시피 생성 요청 타입
export type CreateRecipeRequestDto = {
  title: string;
  description: string;
  cookingTime: number;
  difficultyLevel: number;
  serving: number;
  recipeType: string;
  imageUrl?: string;
  isPublic: boolean;
  ingredientsRequestDto: CreateRecipeIngredientsRequestDto[];
  stepRequestDto: CreateRecipeStepRequestDto[];
};

// 레시피 응답 타입
export type Recipe = {
  id?: number;
  title?: string;
  description?: string;
  cookingTime?: number;
  difficultyLevel?: number;
  serving?: number;
  recipeType?: string;
  imageUrl?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RsDataRecipeResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: Recipe;
};

export const recipeService = {
  createRecipe: async (recipeData: CreateRecipeRequestDto): Promise<Recipe> => {
    const response = await apiClient.post<RsDataRecipeResponseDto>(
      API_ENDPOINTS.RECIPE.CREATE,
      recipeData
    );
    return response?.data || {};
  },
};
