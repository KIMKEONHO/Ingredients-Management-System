package com.example.ingredients_ms.domain.recipeingredient.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
public class RecipeIngredientResponseDto {

    private String ingredientName;
    private Double quantity;
    private String unit;
    private String notes;

}
