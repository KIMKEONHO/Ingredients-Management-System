package com.example.ingredients_ms.domain.foodinventory.dto.request;

import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
// 새로운 식재료를 우리집 냉장고에 초대하기 위한 DTO
public class CreateFoodInventoryRequestDto {
    // 몇 개 샀는지 알려주세요. 넉넉하면 좋죠. (단위: g)
    private Integer quantity;
    // 언제 우리 집에 왔나요? 첫 만남은 소중하니까.
    private LocalDateTime boughtDate;
    // 이별 예정일... 유통기한은 꼭 지켜주세요.
    private LocalDateTime expirationDate;
    // 어디에 보관할까요? 냉장? 냉동? 아니면 그냥 실온?
    private Place place;
    // 어떤 식재료인가요? (예: 당근, 양파)
    private Long ingredientId;
}
