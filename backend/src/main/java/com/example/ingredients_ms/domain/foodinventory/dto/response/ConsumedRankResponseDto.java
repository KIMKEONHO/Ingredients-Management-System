package com.example.ingredients_ms.domain.foodinventory.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter@Builder
public class ConsumedRankResponseDto {

    private long ingredientId;
    private String ingredientName;

    private int rank;
    private long consumedCount;
}
