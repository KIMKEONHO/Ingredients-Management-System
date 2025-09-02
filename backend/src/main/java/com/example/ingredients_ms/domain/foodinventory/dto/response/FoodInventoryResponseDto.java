package com.example.ingredients_ms.domain.foodinventory.dto.response;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
// 냉장고 속 재료 현황 보고서 DTO
public class FoodInventoryResponseDto {
    // 재고 ID, 우리 시스템의 주민등록번호 같은 것
    private Long foodInventoryId;
    // 남은 수량, 0이 되면 슬퍼요.
    private Integer quantity;
    // 단위, '개'인지 'g'인지 헷갈리면 안돼요.
    private String unit;
    // 구매일, 이 날을 기억하며...☆
    private LocalDateTime boughtDate;
    // 유통기한, 임박했다면 서두르세요!
    private LocalDateTime expirationDate;
    // 현재 보관 위치
    private Place place;
    // 주인님 ID
    private Long userId;
    // 식재료 ID
    private Long ingredientId;
    // 식재료 이름 (서비스 좋죠?)
    private String ingredientName;

    // FoodInventory 엔티티를 DTO로 변환하는 마법
    public static FoodInventoryResponseDto fromEntity(FoodInventory foodInventory) {
        return FoodInventoryResponseDto.builder()
                .foodInventoryId(foodInventory.getId())
                .quantity(foodInventory.getQuantity())
                .unit(foodInventory.getUnit())
                .boughtDate(foodInventory.getBoughtDate())
                .expirationDate(foodInventory.getExpirationDate())
                .place(foodInventory.getPlace())
                .userId(foodInventory.getUser().getId())
                .ingredientId(foodInventory.getIngredient().getId())
                .ingredientName(foodInventory.getIngredient().getName())
                .build();
    }
}
