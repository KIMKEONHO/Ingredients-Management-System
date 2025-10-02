package com.example.ingredients_ms.domain.diet.dto.response;

import com.example.ingredients_ms.domain.diet.entity.MealType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @Builder
public class DietResponseDto {

    private Long id;
    private String menu;
    private Integer kcal;
    private MealType mealType;
    private LocalDateTime date;


}
