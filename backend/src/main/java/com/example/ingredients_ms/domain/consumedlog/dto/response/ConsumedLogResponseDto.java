package com.example.ingredients_ms.domain.consumedlog.dto.response;

import com.example.ingredients_ms.domain.consumedlog.entity.ConsumedLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumedLogResponseDto {
    
    private Long categoryId;
    private String categoryName;
    private Integer totalConsumedQuantity; // 사용량 (단위: g)


    public static ConsumedLogResponseDto fromEntity(ConsumedLog log){
        return ConsumedLogResponseDto.builder()
                .categoryId(log.getId())
                .categoryName(log.getInventory().getIngredient().getCategory().getName())
                .totalConsumedQuantity(log.getConsumedQuantity())
                .build();

    }

}
