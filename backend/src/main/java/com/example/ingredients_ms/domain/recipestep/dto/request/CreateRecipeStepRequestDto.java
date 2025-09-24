package com.example.ingredients_ms.domain.recipestep.dto.request;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class CreateRecipeStepRequestDto {

    private Integer stepNumber;
    private Integer cookingTime;
    private String imageUrl;
    private String description;

}
