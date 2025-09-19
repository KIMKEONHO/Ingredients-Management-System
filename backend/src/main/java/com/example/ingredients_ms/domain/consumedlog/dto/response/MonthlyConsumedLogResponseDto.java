package com.example.ingredients_ms.domain.consumedlog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyConsumedLogResponseDto {
    
    private int month; // 월 (1~12)
    private String monthName; // 월 이름 (예: "1월", "2월")
    private Long categoryId; // 카테고리 ID
    private String categoryName; // 카테고리 이름
    private Integer totalConsumedQuantity; // 해당 월의 총 사용량 (단위: g)
}

