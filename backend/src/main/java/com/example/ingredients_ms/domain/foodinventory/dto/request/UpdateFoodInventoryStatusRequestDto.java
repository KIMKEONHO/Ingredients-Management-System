package com.example.ingredients_ms.domain.foodinventory.dto.request;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateFoodInventoryStatusRequestDto {
    private FoodStatus status;
}
