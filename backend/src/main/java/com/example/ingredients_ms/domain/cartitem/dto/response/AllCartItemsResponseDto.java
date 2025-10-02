package com.example.ingredients_ms.domain.cartitem.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter@Setter@Builder
public class AllCartItemsResponseDto {

    private double cost;
    private String name;
    private Integer count;
    private LocalDateTime createdAt;

}
