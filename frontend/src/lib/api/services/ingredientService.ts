import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { components } from '@/lib/backend/apiV1/schema';

export type Ingredient = components['schemas']['IngredientResponseDto'];
export type Category = components['schemas']['CategoryResponseDto'];

export const ingredientService = {
  getAllIngredients: async (): Promise<Ingredient[]> => {
    const response = await apiClient.get(API_ENDPOINTS.INGREDIENT.BASE);

    console.log('식재료 목록:', response); // Added for debugging
    return response.data;
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get(API_ENDPOINTS.INGREDIENT.BASE);
    const ingredients: Ingredient[] = response.data;
    const categories = ingredients.reduce((acc, ingredient) => {
      if (ingredient.categoryName && !acc.find(c => c.name === ingredient.categoryName)) {
        acc.push({ id: ingredient.categoryId, name: ingredient.categoryName });
      }
      return acc;
    }, [] as { id?: number, name: string }[]);
    return categories.map(c => ({ categoryId: c.id, categoryName: c.name }));
  },
};


// src/lib/backend/apiV1/schema.d.ts 파일에서 IngredientResponseDto를 찾을 수 있습니다.
// 해당 파일은 OpenAPI 스키마에서 자동 생성된 타입 정의를 포함하고 있습니다.
// 예시:
// export namespace components {
//   export namespace schemas {
//     export interface IngredientResponseDto {
//       id?: number;
//       name?: string;
//       categoryName?: string;
//     }
//     export interface CategoryResponseDto {
//       categoryId?: number;
//       categoryName?: string;
//     }
//   }
// }
// 위와 같은 구조로 타입이 정의되어 있을 것입니다.
