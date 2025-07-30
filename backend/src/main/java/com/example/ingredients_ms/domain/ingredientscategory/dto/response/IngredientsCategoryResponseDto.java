package com.example.ingredients_ms.domain.ingredientscategory.dto.response;

import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter // 모든 필드의 Getter 메서드를 자동 생성
@NoArgsConstructor // 기본 생성자를 자동 생성
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자를 자동 생성
@Builder // 빌더 패턴을 사용하여 객체 생성을 용이하게 함

public class IngredientsCategoryResponseDto {


    private Long id;
    private String name;
    private LocalDateTime createAt;

    // 엔티티(IngredientCategory)를 DTO로 변환하는 정적 팩토리 메서드 (선택 사항이지만 유용)
    public static IngredientsCategoryResponseDto fromEntity(IngredientsCategory category) {
        return IngredientsCategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .createAt(category.getCreatedAt())
                .build();
    }



}
