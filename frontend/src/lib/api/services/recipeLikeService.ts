import { apiClient } from '../client';
import type { components } from '../../backend/apiV1/schema';

// 타입 정의
export type RecipeLikeResponseDto = components['schemas']['RecipeLikeResponseDto'];
export type RsDataRecipeLikeResponseDto = components['schemas']['RsDataRecipeLikeResponseDto'];
export type RsDataBoolean = components['schemas']['RsDataBoolean'];

/**
 * 레시피 좋아요 서비스
 */
class RecipeLikeService {
  /**
   * 레시피 좋아요 상태 조회
   * @param recipeId - 레시피 ID
   * @returns 좋아요 여부 (boolean)
   */
  async checkIsLiked(recipeId: string | number): Promise<boolean> {
    try {
      const response = await apiClient.get<RsDataBoolean>(
        `/api/v1/recipe/${recipeId}/like`
      );
      return response.data ?? false;
    } catch (error) {
      console.error('레시피 좋아요 상태 조회 실패:', error);
      // 에러 발생 시 기본값 반환 (로그인 안 한 경우 등)
      return false;
    }
  }

  /**
   * 레시피 좋아요 추가
   * @param recipeId - 레시피 ID
   * @returns 좋아요 응답 정보
   */
  async likeRecipe(recipeId: string | number): Promise<RecipeLikeResponseDto> {
    try {
      const response = await apiClient.post<RsDataRecipeLikeResponseDto>(
        `/api/v1/recipe/${recipeId}/like`
      );
      if (!response.data) {
        throw new Error('좋아요 추가에 실패했습니다.');
      }
      return response.data;
    } catch (error) {
      console.error('레시피 좋아요 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 레시피 좋아요 취소
   * @param recipeId - 레시피 ID
   * @returns 좋아요 응답 정보
   */
  async unlikeRecipe(recipeId: string | number): Promise<RecipeLikeResponseDto> {
    try {
      const response = await apiClient.delete<RsDataRecipeLikeResponseDto>(
        `/api/v1/recipe/${recipeId}/like`
      );
      if (!response.data) {
        throw new Error('좋아요 취소에 실패했습니다.');
      }
      return response.data;
    } catch (error) {
      console.error('레시피 좋아요 취소 실패:', error);
      throw error;
    }
  }

  /**
   * 레시피 좋아요 토글 (추가/취소)
   * @param recipeId - 레시피 ID
   * @param isLiked - 현재 좋아요 상태
   * @returns 좋아요 응답 정보
   */
  async toggleLike(recipeId: string | number, isLiked: boolean): Promise<RecipeLikeResponseDto> {
    if (isLiked) {
      return await this.unlikeRecipe(recipeId);
    } else {
      return await this.likeRecipe(recipeId);
    }
  }
}

export const recipeLikeService = new RecipeLikeService();

