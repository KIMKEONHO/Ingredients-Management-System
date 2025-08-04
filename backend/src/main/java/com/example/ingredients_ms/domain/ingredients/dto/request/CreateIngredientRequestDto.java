package com.example.ingredients_ms.domain.ingredients.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateIngredientRequestDto {

    private String name;

    private Long categoryId;
}