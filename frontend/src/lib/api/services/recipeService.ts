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

// 레시피 재료 응답 타입
export type RecipeIngredientResponseDto = {
  ingredientName: string;
  unit: string;
  quantity: number;
};

// 모든 레시피 응답 타입
export type AllRecipeResponseDto = {
  createdAt: string;
  recipeIngredientResponseDto: RecipeIngredientResponseDto[];
  userNickName: string;
  description: string;
  title: string;
  difficultyLevel: number;
  userProfile?: string;
  cookingTime: number;
  imageUrl?: string; // 레시피 이미지 URL 추가
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

export const recipeService = {
  // 모든 레시피 조회
  getAllRecipes: async (): Promise<AllRecipeResponseDto[]> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
    const url = `${API_BASE_URL}/api/v1/recipe/all`;
    
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

    const result = await response.json();
    
    // API 응답 데이터 검사
    console.log('=== API 응답 데이터 검사 ===');
    console.log('API 응답 전체:', result);
    console.log('API 응답 타입:', typeof result);
    console.log('API 응답 키들:', Object.keys(result || {}));
    console.log('resultCode:', result?.resultCode);
    console.log('msg:', result?.msg);
    console.log('data 타입:', typeof result?.data);
    console.log('data:', result?.data);
    
    // data가 배열인지 확인
    if (Array.isArray(result?.data)) {
      console.log('데이터 배열 길이:', result.data.length);
      if (result.data.length > 0) {
        console.log('첫 번째 레시피 상세:', result.data[0]);
        console.log('첫 번째 레시피 키들:', Object.keys(result.data[0] || {}));
        console.log('첫 번째 레시피 imageUrl:', result.data[0].imageUrl);
        console.log('imageUrl 타입:', typeof result.data[0].imageUrl);
      }
    } else {
      console.log('data가 배열이 아님:', result?.data);
    }
    
    return Array.isArray(result?.data) ? result.data : [];
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

