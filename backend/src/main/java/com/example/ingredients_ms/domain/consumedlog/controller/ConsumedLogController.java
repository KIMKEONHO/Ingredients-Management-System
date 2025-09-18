package com.example.ingredients_ms.domain.consumedlog.controller;

import com.example.ingredients_ms.domain.consumedlog.Service.ConsumedLogService;
import com.example.ingredients_ms.domain.consumedlog.dto.response.ConsumedLogResponseDto;
import com.example.ingredients_ms.domain.foodinventory.dto.request.UpdateFoodInventoryQuantityRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.ConsumedRankResponseDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.FoodInventoryResponseDto;
import com.example.ingredients_ms.domain.foodinventory.service.FoodInventoryService;
import com.example.ingredients_ms.global.jwt.TokenService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/consumedlog")
@Tag(name = "식품 재고 사용량 API", description = "식품 재고 사용량 관리를 위한 API")
@RequiredArgsConstructor
public class ConsumedLogController {


    private final TokenService tokenService;
    private final ConsumedLogService consumedLogService;

    // 식품 재고 수량만 수정하는 엔드포인트 추가
    @Operation(summary = "식품 재고 사용량 조회", description = "해당 식품 재고의 사용량을 조회합니다.")
    @GetMapping("/")
    public RsData<List<ConsumedLogResponseDto>> getConsumedQuantity() {

        Long userId = tokenService.getIdFromToken();

        List<ConsumedLogResponseDto> logs = consumedLogService.getConsumedLogByCategory(userId);


        return new RsData<>("200", "식품 재고 수량이 성공적으로 수정되었습니다.",logs);
    }
}
