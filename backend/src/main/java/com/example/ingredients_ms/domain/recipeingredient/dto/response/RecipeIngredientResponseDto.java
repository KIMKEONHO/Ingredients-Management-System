package com.example.ingredients_ms.domain.recipeingredient.dto.response;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class RecipeIngredientResponseDto {

    private String ingredientName;
    private Double quantity;
    private String unit;

}
