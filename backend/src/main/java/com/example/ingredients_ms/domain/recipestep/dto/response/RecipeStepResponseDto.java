package com.example.ingredients_ms.domain.recipestep.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
public class RecipeStepResponseDto {

    private Integer stepNumber;

    private String description;

    private String imageUrl;

    private Integer cookingTime;
}
