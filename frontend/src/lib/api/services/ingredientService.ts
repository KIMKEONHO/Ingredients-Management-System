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

export type BulkUpdateCategoryRequest = {
  ingredientIds: number[];
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

  // 일괄 카테고리 변경 (개선된 버전)
  bulkUpdateCategory: async (
    bulkData: BulkUpdateCategoryRequest, 
    onProgress?: (completed: number, total: number) => void
  ): Promise<void> => {
    try {
      // 유효성 검증
      if (!bulkData.ingredientIds || bulkData.ingredientIds.length === 0) {
        throw new Error('선택된 식재료가 없습니다.');
      }
      
      if (!bulkData.categoryId || bulkData.categoryId <= 0) {
        throw new Error('유효하지 않은 카테고리 ID입니다.');
      }

      // 한 번만 전체 식재료 목록을 가져옴
      const allIngredients = await ingredientService.getAllIngredients();
      const ingredientsMap = new Map(allIngredients.map(ing => [ing.id, ing]));

      // 배치 크기 설정 (동시 요청 수 제한)
      const BATCH_SIZE = 5;
      const batches = [];
      
      for (let i = 0; i < bulkData.ingredientIds.length; i += BATCH_SIZE) {
        batches.push(bulkData.ingredientIds.slice(i, i + BATCH_SIZE));
      }

      let completed = 0;
      const total = bulkData.ingredientIds.length;

      // 배치별로 순차 처리
      for (const batch of batches) {
        try {
          // 현재 배치의 요청들을 병렬로 처리
          await Promise.all(
            batch.map(async (ingredientId) => {
              const ingredient = ingredientsMap.get(ingredientId);
              
              if (!ingredient || !ingredient.name) {
                throw new Error(`ID ${ingredientId}에 해당하는 식재료를 찾을 수 없습니다.`);
              }

              return ingredientService.updateIngredient(ingredientId, {
                name: ingredient.name,
                categoryId: bulkData.categoryId
              });
            })
          );
          
          completed += batch.length;
          onProgress?.(completed, total);
          
          // 배치 간 짧은 지연 (서버 부하 방지)
          if (batches.indexOf(batch) < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`배치 처리 중 오류 발생:`, error);
          throw error;
        }
      }
    } catch (error) {
      console.error('일괄 카테고리 변경 API 오류:', error);
      throw error;
    }
  },
};
