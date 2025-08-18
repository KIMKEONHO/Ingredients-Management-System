package com.example.ingredients_ms.domain.diet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class WeekStatisticsResponseDto {
    private LocalDate date;   // yyyy-MM-dd
    private double averageKcal;
}