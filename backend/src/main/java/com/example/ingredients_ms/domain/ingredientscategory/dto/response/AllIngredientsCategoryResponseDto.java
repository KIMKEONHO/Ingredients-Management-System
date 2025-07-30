package com.example.ingredients_ms.domain.ingredientscategory.dto.response;


import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter // 모든 필드의 Getter 메서드를 자동 생성
@NoArgsConstructor // 기본 생성자를 자동 생성
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자를 자동 생성
@Builder // 빌더 패턴을 사용하여 객체 생성을 용이하게 함

public class AllIngredientsCategoryResponseDto {

    private Long id;
    private String name;


    public static AllIngredientsCategoryResponseDto fromEntity(IngredientsCategory category){
        return AllIngredientsCategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

}
