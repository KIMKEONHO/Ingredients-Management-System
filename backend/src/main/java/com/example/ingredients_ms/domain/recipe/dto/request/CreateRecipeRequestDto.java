package com.example.ingredients_ms.domain.recipe.dto.request;

import lombok.Getter;

@Getter
public class CreateRecipeRequestDto {

    private String title;
    private String description;
    private Integer cookingTime;
    private Integer difficultyLevel;
    private Integer serving;
    private String recipeType;
    private String imageUrl;
    private boolean isPublic;

}
