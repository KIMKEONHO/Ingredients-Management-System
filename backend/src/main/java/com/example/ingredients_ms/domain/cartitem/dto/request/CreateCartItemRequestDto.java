package com.example.ingredients_ms.domain.cartitem.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter@Builder
public class CreateCartItemRequestDto {

    private Long ingredientId;
    private Integer count;
    private double cost = 0.0;

}
