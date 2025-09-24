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
  createRecipe: async (
    recipeData: CreateRecipeRequestDto, 
    recipeImage?: File, 
    stepImages?: File[]
  ): Promise<Recipe> => {
    // FormData 생성
    const formData = new FormData();
    
    // 레시피 데이터를 Blob으로 변환하여 추가
    const recipeDataBlob = new Blob([JSON.stringify(recipeData)], { 
      type: 'application/json' 
    });
    formData.append('recipeData', recipeDataBlob);
    
    // 메인 이미지 추가 (있는 경우)
    if (recipeImage) {
      formData.append('recipeImage', recipeImage);
    }
    
    // 단계별 이미지들 추가 (있는 경우)
    if (stepImages && stepImages.length > 0) {
      stepImages.forEach((image, index) => {
        if (image) {
          formData.append('stepImages', image);
        }
      });
    }

    // fetch API를 직접 사용하여 multipart/form-data 전송
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
    const url = `${API_BASE_URL}${API_ENDPOINTS.RECIPE.CREATE}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include', // 쿠키 포함
      headers: {
        // Content-Type을 명시적으로 설정하지 않음 (fetch가 자동으로 설정하도록)
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RsDataRecipeResponseDto = await response.json();
    return result?.data || {};
  },
};

