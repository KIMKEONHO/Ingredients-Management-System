package com.example.ingredients_ms.domain.diet.dto.request;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CreateDietRequestDto {
    private String menu;
    private Integer kcal;
    private LocalDateTime date;
    private String mealType;
}
