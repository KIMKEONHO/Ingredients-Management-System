package com.example.ingredients_ms.domain.cartitem.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class UpdateCartItemRequestDto {
    private Integer count;
    private double price;
}
