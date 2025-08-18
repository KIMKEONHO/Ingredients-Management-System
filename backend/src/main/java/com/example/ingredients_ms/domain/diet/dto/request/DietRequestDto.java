package com.example.ingredients_ms.domain.diet.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DietRequestDto {

    private int year;
    private int month;
    private Integer day;

}
