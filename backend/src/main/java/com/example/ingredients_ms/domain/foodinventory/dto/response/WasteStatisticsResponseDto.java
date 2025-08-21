package com.example.ingredients_ms.domain.foodinventory.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WasteStatisticsResponseDto  {

    private Long ingredientId;                 // 식재료 ID
    private String ingredientName;             // 식재료 이름

    private Integer totalWastedCount;          // 버려진 개수
    private Integer consumedCount;         // 소비 개수

    private double wasteRate;              // 낭비율 (%)
    private double consumedRate;           // 소비율 (%)

}
