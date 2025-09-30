package com.example.ingredients_ms.domain.recipe.dto.response;

import com.example.ingredients_ms.domain.recipe.entity.RecipeType;
import com.example.ingredients_ms.domain.recipeingredient.dto.response.RecipeIngredientResponseDto;
import com.example.ingredients_ms.domain.recipestep.dto.response.RecipeStepResponseDto;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter@Setter@Builder
public class RecipeDetailResponseDto {

    private Long userId;

    // 레시피에 대해 필요한 필드
    private String title;
    private String description;
    private Integer cookingTime;
    private Integer difficultyLevel;
    private Integer servings;
    private String imageUrl;
    private RecipeType recipeType;
    private Long viewCount;
    private Long likeCount;
    private String userNickName;
    private LocalDateTime createdAt;
    private String profileUrl;

    // 재료 관련 필드
    private List<RecipeIngredientResponseDto> recipeIngredientResponseDtos;

    private List<RecipeStepResponseDto> recipeStepResponseDtos;
}
