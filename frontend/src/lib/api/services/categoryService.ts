import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

export type Category = {
  id?: number;
  name?: string;
  createdAt?: string;
};

export type NewCategory = {
  name?: string;
};

export type SuccessResponse = { resultCode: string; msg: string };

export type RsDataListAllIngredientsCategoryResponseDto = {
  resultCode?: string;
  msg?: string;
  data?: Category[];
};

export type RsDataObject = {
  resultCode?: string;
  msg?: string;
  data?: Record<string, never>;
};

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<RsDataListAllIngredientsCategoryResponseDto>(
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
      const response = await apiClient.post<RsDataObject>(
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
      const response = await apiClient.put<RsDataObject>(url, updatedCategory);
      return { resultCode: response?.resultCode ?? '', msg: response?.msg ?? '' };
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      throw error;
    }
  },

  deleteCategory: async (categoryId: number): Promise<SuccessResponse> => {
    try {
      const url = createApiUrl(API_ENDPOINTS.CATEGORY.DETAIL, { categoryId });
      const response = await apiClient.delete<RsDataObject>(url);
      return { resultCode: response?.resultCode ?? '', msg: response?.msg ?? '' };
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      throw error;
    }
  },
};