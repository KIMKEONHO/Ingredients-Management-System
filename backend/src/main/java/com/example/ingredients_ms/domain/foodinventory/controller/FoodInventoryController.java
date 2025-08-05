package com.example.ingredients_ms.domain.foodinventory.controller;

import com.example.ingredients_ms.domain.foodinventory.dto.request.CreateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.request.UpdateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.FoodInventoryResponseDto;
import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import com.example.ingredients_ms.domain.foodinventory.service.FoodInventoryService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/inventory")
@Tag(name = "식품 재고 API", description = "식품 재고 관리를 위한 API")
@RequiredArgsConstructor
public class FoodInventoryController {

    private final FoodInventoryService foodInventoryService;

    @Operation(summary = "보관 장소 목록 조회", description = "식품을 보관할 수 있는 장소의 목록을 조회합니다.")
    @GetMapping("/places")
    public RsData<List<String>> getPlaceValues() {
        List<String> places = Arrays.stream(Place.values())
                .map(Place::getValue)
                .collect(Collectors.toList());
        return new RsData<>("200", "보관 장소 목록이 성공적으로 조회되었습니다.", places);
    }

    @Operation(summary = "식품 재고 추가", description = "새로운 식품 재고를 추가합니다. 냉장고를 채워보세요!")
    @PostMapping("/")
    public RsData<FoodInventoryResponseDto> createFoodInventory(@RequestBody CreateFoodInventoryRequestDto requestDto) {
        FoodInventoryResponseDto responseDto = foodInventoryService.createFoodInventory(requestDto);
        return new RsData<>("200", "식품 재고가 성공적으로 추가되었습니다.", responseDto);
    }

    @Operation(summary = "사용자별 식품 재고 목록 조회", description = "특정 사용자의 모든 식품 재고 목록을 조회합니다. 냉장고 파먹기 타임!")
    @GetMapping("/user/{userId}")
    public RsData<List<FoodInventoryResponseDto>> getFoodInventories(@PathVariable Long userId) {
        List<FoodInventoryResponseDto> responseDtos = foodInventoryService.getFoodInventories(userId);
        return new RsData<>("200", "사용자별 식품 재고 목록이 성공적으로 조회되었습니다.", responseDtos);
    }

    // 카테고리별
    @Operation(summary = "카테고리별 식품 재고 목록 조회", description = "특정 카테고리에 속하는 식품 재고 목록을 조회합니다. 오늘은 어떤 종류의 재료를 사용해볼까요?")
    @GetMapping("/user/{userId}/category/{categoryId}")
    public RsData<List<FoodInventoryResponseDto>> getFoodInventoriesByCategory(@PathVariable Long userId, @PathVariable Long categoryId) {
        List<FoodInventoryResponseDto> responseDtos = foodInventoryService.getFoodInventoriesByCategory(userId, categoryId);
        return new RsData<>("200", "카테고리별 식품 재고 목록이 성공적으로 조회되었습니다.", responseDtos);
    }

    @Operation(summary = "식품 재고 수정", description = "기존 식품 재고 정보를 수정합니다. 앗! 잘못샀네!")
    @PutMapping("/")
    public RsData<FoodInventoryResponseDto> updateFoodInventory(@RequestBody UpdateFoodInventoryRequestDto requestDto) {
        FoodInventoryResponseDto responseDto = foodInventoryService.updateFoodInventory(requestDto);
        return new RsData<>("200", "식품 재고가 성공적으로 수정되었습니다.", responseDto);
    }

    @Operation(summary = "식품 재고 삭제", description = "식품 재고를 삭제합니다. 다 먹었다!")
    @DeleteMapping("/{foodInventoryId}")
    public RsData<?> deleteFoodInventory(@PathVariable Long foodInventoryId) {
        foodInventoryService.deleteFoodInventory(foodInventoryId);
        return new RsData<>("200", "식품 재고가 성공적으로 삭제되었습니다.", null);
    }
}
