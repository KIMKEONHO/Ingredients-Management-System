package com.example.ingredients_ms.domain.ingredients.dto.response;

import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
// 식재료 응답 DTO
public class IngredientResponseDto {
    // 식재료 ID
    private Long id;
    // 식재료 이름
    private String name;
    // 카테고리 이름
    private String categoryName;
    // 생성 날짜
    private LocalDateTime createdAt;

    public static IngredientResponseDto fromEntity(Ingredients ingredient) {
        return IngredientResponseDto.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .categoryName(ingredient.getCategory().getName())
                .createdAt(ingredient.getCreatedAt())
                .build();
    }
}
