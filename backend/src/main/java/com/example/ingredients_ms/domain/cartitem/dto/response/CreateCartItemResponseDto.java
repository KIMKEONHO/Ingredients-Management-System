package com.example.ingredients_ms.domain.cartitem.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter@Builder
public class CreateCartItemResponseDto {
    private String ingredientName;
    private Integer count;
}
