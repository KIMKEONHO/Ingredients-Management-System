package com.example.ingredients_ms.domain.reciperecommendation.dto.response;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
// 레시피 추천 응답 DTO
public class RecipeRecommendationResponseDto {
    // 레시피 ID
    private Long recipeId;
    // 레시피 제목
    private String title;
    // 조리 시간 (분)
    private Integer cookingTime;
    // 난이도 레벨
    private Integer difficultyLevel;
    // 좋아요 수
    private Long likeCount;
    // 조회 수
    private Long viewCount;

    // Recipe 엔티티를 DTO로 변환하는 정적 메서드
    public static RecipeRecommendationResponseDto fromEntity(Recipe recipe) {
        return RecipeRecommendationResponseDto.builder()
                .recipeId(recipe.getId())
                .title(recipe.getTitle())
                .cookingTime(recipe.getCookingTime())
                .difficultyLevel(recipe.getDifficultyLevel())
                .likeCount(recipe.getLikeCount())
                .viewCount(recipe.getViewCount())
                .build();
    }

}
