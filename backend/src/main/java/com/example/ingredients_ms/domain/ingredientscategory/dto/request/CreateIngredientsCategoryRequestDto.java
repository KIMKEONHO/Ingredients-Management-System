package com.example.ingredients_ms.domain.ingredientscategory.dto.request;


import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Getter // 모든 필드의 Getter 메서드를 자동 생성
@NoArgsConstructor // 기본 생성자를 자동 생성
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자를 자동 생성

public class CreateIngredientsCategoryRequestDto {

    private String name;

}
