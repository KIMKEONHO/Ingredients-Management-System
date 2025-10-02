package com.example.ingredients_ms.domain.recipe.dto.request;

import com.example.ingredients_ms.domain.recipeingredient.dto.request.CreateRecipeIngredientsRequestDto;
import com.example.ingredients_ms.domain.recipestep.dto.request.CreateRecipeStepRequestDto;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
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

    private List<CreateRecipeIngredientsRequestDto> ingredientsRequestDto;
    private List<CreateRecipeStepRequestDto> stepRequestDto;
}
