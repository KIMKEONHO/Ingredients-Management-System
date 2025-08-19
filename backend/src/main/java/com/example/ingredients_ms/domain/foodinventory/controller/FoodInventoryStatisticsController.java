package com.example.ingredients_ms.domain.foodinventory.controller;

import com.example.ingredients_ms.domain.foodinventory.dto.response.ConsumedRankResponseDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.WasteStatisticsResponseDto;
import com.example.ingredients_ms.domain.foodinventory.service.FoodInventoryStatisticsService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/statistics")
@RequiredArgsConstructor
public class FoodInventoryStatisticsController {

    private final FoodInventoryStatisticsService foodInventoryStatisticsService;

    // 식재료 낭비 통계 기능
    @GetMapping("/ingredients")
    public RsData<List<WasteStatisticsResponseDto>> getFoodInventoryStatistics(
            @CurrentUser SecurityUser securityUser
            ){
        List<WasteStatisticsResponseDto> stats = foodInventoryStatisticsService.consumedStatistics(securityUser.getId());
        return new RsData<>("200-1", "ingredients statistics", stats);
    }


    // 가장 많이 소비되는 식재료 통계 기능
    @GetMapping("/most/consumed")
    public RsData<List<ConsumedRankResponseDto>> getMostConsumedFoodInventoryStatistics(
            @CurrentUser SecurityUser securityUser
    ){
        List<ConsumedRankResponseDto> response = foodInventoryStatisticsService.mostConsumedStatistics(securityUser.getId());
        return new RsData<>("200-1", "most consumed statistics", response);
    }



}
