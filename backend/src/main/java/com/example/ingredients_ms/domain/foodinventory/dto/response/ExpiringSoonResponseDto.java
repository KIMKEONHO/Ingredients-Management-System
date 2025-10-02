package com.example.ingredients_ms.domain.foodinventory.dto.response;

import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter @Setter @Builder
public class ExpiringSoonResponseDto {

    private LocalDateTime boughtDate;
    private String ingredientsName;
    private Integer quantity; // 수량 (단위: g)
    private LocalDateTime expirationDate;
    private Place place;
}
