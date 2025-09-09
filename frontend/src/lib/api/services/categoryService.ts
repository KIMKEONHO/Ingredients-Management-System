import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';
import type { components } from '@/lib/backend/apiV1/schema';

export type Category = components['schemas']['AllIngredientsCategoryResponseDto'];
export type NewCategory = components['schemas']['CreateIngredientsCategoryRequestDto'];

export type SuccessResponse = { resultCode: string; msg: string };

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<components['schemas']['RsDataListAllIngredientsCategoryResponseDto']>(
        API_ENDPOINTS.CATEGORY.BASE
      );
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      throw error;
    }
  },

  createCategory: async (newCategory: NewCategory): Promise<SuccessResponse> => {
    try {
      const response = await apiClient.post<components['schemas']['RsDataObject']>(
        API_ENDPOINTS.CATEGORY.BASE,
        newCategory
      );
      return { resultCode: response?.resultCode ?? '', msg: response?.msg ?? '' };
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
      throw error;
    }
  },

  updateCategory: async (categoryId: number, updatedCategory: NewCategory): Promise<SuccessResponse> => {
    try {
      const url = createApiUrl(API_ENDPOINTS.CATEGORY.DETAIL, { categoryId });
      const response = await apiClient.put<components['schemas']['RsDataObject']>(url, updatedCategory);
      return { resultCode: response?.resultCode ?? '', msg: response?.msg ?? '' };
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      throw error;
    }
  },

  deleteCategory: async (categoryId: number): Promise<SuccessResponse> => {
    try {
      const url = createApiUrl(API_ENDPOINTS.CATEGORY.DETAIL, { categoryId });
      const response = await apiClient.delete<components['schemas']['RsDataObject']>(url);
      return { resultCode: response?.resultCode ?? '', msg: response?.msg ?? '' };
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      throw error;
    }
  },
};