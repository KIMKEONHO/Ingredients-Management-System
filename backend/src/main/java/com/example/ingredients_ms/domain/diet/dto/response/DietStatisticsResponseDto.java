package com.example.ingredients_ms.domain.diet.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DietStatisticsResponseDto {
    private double averageKcal;
    private Double diffFromLast;
    private Double diffRate;
}
