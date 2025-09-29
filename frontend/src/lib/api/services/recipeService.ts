import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

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

// 레시피 재료 응답 타입
export type RecipeIngredientResponseDto = {
  ingredientName: string;
  unit: string;
  quantity: number;
  notes?: string;
};

// 레시피 단계 응답 타입
export type RecipeStepResponseDto = {
  stepNumber: number;
  description: string;
  imageUrl?: string;
  cookingTime: number;
};

// 레시피 상세 응답 타입
export type RecipeDetailResponseDto = {
  cookingTime: number;
  createdAt: string;
  description: string;
  difficultyLevel: number;
  imageUrl?: string;
  likeCount: number;
  profileUrl?: string;
  userNickName: string;
  userId?: number; // 작성자 ID 추가
  viewCount: number;
  title: string;
  servings: number;
  recipeType: string;
  recipeIngredientResponseDtos: RecipeIngredientResponseDto[];
  recipeStepResponseDtos: RecipeStepResponseDto[];
};

// 모든 레시피 응답 타입
export type AllRecipeResponseDto = {
  recipeId: number;
  createdAt: string;
  recipeIngredientResponseDto: RecipeIngredientResponseDto[];
  userNickName: string;
  description: string;
  title: string;
  difficultyLevel: number;
  userProfile?: string;
  cookingTime: number;
  imageUrl?: string;
  viewCount: number;
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

export type RsDataAllRecipeResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: AllRecipeResponseDto[];
};

export type RsDataRecipeDetailResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: RecipeDetailResponseDto;
};

export const recipeService = {
  // 모든 레시피 조회
  getAllRecipes: async (): Promise<AllRecipeResponseDto[]> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
    const url = `${API_BASE_URL}${API_ENDPOINTS.RECIPE.ALL}`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RsDataAllRecipeResponseDto = await response.json();
    return result?.data || [];
  },

  // 레시피 상세 조회
  getRecipeDetail: async (recipeId: string): Promise<RecipeDetailResponseDto> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
    const url = `${API_BASE_URL}${createApiUrl(API_ENDPOINTS.RECIPE.DETAIL, { recipeId })}`;
    
    console.log('API 요청 URL:', url);
    console.log('요청하는 recipeId:', recipeId, 'type:', typeof recipeId);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RsDataRecipeDetailResponseDto = await response.json();
    if (!result?.data) {
      throw new Error('레시피 상세 정보를 찾을 수 없습니다.');
    }
    return result.data;
  },

  // 레시피 삭제
  deleteRecipe: async (recipeId: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
    const url = `${API_BASE_URL}${createApiUrl(API_ENDPOINTS.RECIPE.DELETE, { recipeId })}`;
    
    console.log('레시피 삭제 API 요청 URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `레시피 삭제에 실패했습니다. (${response.status})`);
    }
  },

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
      console.log('메인 이미지 파일 추가:', recipeImage.name, recipeImage.size);
      formData.append('recipeImage', recipeImage);
    }
    
    // 단계별 이미지들 추가 (있는 경우)
    if (stepImages && stepImages.length > 0) {
      stepImages.forEach((image, index) => {
        if (image) {
          console.log(`단계 ${index} 이미지 파일 추가:`, image.name, image.size);
          formData.append('stepImages', image);
        }
      });
    }

    console.log('FormData 내용:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    // fetch API를 직접 사용하여 multipart/form-data 전송
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
    const url = `${API_BASE_URL}${API_ENDPOINTS.RECIPE.CREATE}`;
    
    console.log('API 요청 URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include', // 쿠키 포함
      headers: {
        // Content-Type을 명시적으로 설정하지 않음 (fetch가 자동으로 설정하도록)
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 오류:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RsDataRecipeResponseDto = await response.json();
    console.log('API 응답:', result);
    return result?.data || {};
  },
};

