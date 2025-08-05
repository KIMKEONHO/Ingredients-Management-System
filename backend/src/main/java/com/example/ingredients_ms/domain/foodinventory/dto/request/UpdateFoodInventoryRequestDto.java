package com.example.ingredients_ms.domain.foodinventory.dto.request;

import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
// 냉장고 속 재료 정보, 최신으로 업데이트! DTO
public class UpdateFoodInventoryRequestDto {
    // 어떤 재료를 수정할지 ID를 알려주세요.
    private Long foodInventoryId;
    // 수량이 변경되었나요?
    private Integer quantity;
    // 단위가 변경되었나요?
    private String unit;
    // 구매일이 변경되었나요? (그럴리가...)
    private LocalDateTime boughtDate;
    // 유통기한이 변경되었나요? (시간을 되돌리는 마법?)
    private LocalDateTime expirationDate;
    // 보관 장소를 옮겼나요?
    private Set<Place> places;
}
