package com.example.ingredients_ms.domain.recipeingredient.dto.request;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class CreateRecipeIngredientsRequestDto {

    private Long ingredientId;
    private Double quantity;
    private String unit;
    private String notes;

}
