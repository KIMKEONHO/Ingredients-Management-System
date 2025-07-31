package com.example.ingredients_ms.domain.ingredients.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// 식재료 생성을 위한 요청 DTO
public class CreateIngredientRequestDto {
    // 식재료 이름
    private String name;
    // 카테고리 ID
    private Long categoryId;
}
