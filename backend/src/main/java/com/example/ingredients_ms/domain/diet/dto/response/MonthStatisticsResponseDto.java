package com.example.ingredients_ms.domain.diet.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthStatisticsResponseDto {
    private int month;
    private double averageKcal;
    private Double diffFromLast;
    private Double diffRate;
}
