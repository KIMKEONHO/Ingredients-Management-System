package com.example.ingredients_ms.domain.ingredients.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Jackson이 JSON 데이터를 이 클래스의 객체로 변환할 때 사용합니다.
@Getter
@Setter // Setter가 있어야 Jackson이 값을 주입할 수 있습니다.
@NoArgsConstructor
public class IngredientDto {
    private String category;
    private String name;
}
