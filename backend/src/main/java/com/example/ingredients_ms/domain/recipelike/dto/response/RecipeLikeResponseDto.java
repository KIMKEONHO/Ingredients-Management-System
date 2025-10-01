package com.example.ingredients_ms.domain.recipelike.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecipeLikeResponseDto {

    private boolean isActive;
    private Long likeCount;


}
