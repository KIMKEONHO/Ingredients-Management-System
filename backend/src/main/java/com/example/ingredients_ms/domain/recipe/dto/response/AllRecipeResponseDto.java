package com.example.ingredients_ms.domain.recipe.dto.response;

import com.example.ingredients_ms.domain.recipeingredient.dto.response.RecipeIngredientResponseDto;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter
@Setter
@Builder
public class AllRecipeResponseDto {

    // 레시피 테이블에서 가져올 정보들
    private String title;
    private String userNickName;
    private String userProfile;
    private String description;
    private LocalDateTime createdAt;
    private Integer difficultyLevel;
    private Integer cookingTime;

    // 레시피 재료
    private List<RecipeIngredientResponseDto> recipeIngredientResponseDto;

    // 좋아요 갯수
    private Integer likeCount;

}
