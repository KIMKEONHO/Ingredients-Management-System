package com.example.ingredients_ms.domain.foodinventory.controller;

import com.example.ingredients_ms.domain.foodinventory.dto.request.CreateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.request.UpdateFoodInventoryQuantityRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.request.UpdateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.ExpiringSoonResponseDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.FoodInventoryResponseDto;
import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import com.example.ingredients_ms.domain.foodinventory.service.FoodInventoryService;
import com.example.ingredients_ms.global.jwt.TokenService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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
    private final TokenService tokenService;

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
    public RsData<FoodInventoryResponseDto> createFoodInventory(HttpServletRequest request, @RequestBody CreateFoodInventoryRequestDto requestDto) {
        Long userId = tokenService.getIdFromToken();
        FoodInventoryResponseDto responseDto = foodInventoryService.createFoodInventory(userId, requestDto);
        return new RsData<>("200", "식품 재고가 성공적으로 추가되었습니다.", responseDto);
    }
    @Operation(summary = "보관장소별 식품 재고 목록 조회", description = "특정 보관장소의 모든 식품 재고 목록을 조회힙니다.")
    @GetMapping("/place")
    public RsData<?> getFoodInventoriesByPlace(HttpServletRequest request,@RequestParam String place){

        Long userId = tokenService.getIdFromToken();

        List<FoodInventoryResponseDto> responseDtos = foodInventoryService.getFoodInventoriesByPlace(userId,place);

        return new RsData<>("200","보관장소의 식품 재고 목록이 성공적으로 조회되었습니다.",responseDtos);
    }

    @Operation(summary = "사용자별 식품 재고 목록 조회", description = "특정 사용자의 모든 식품 재고 목록을 조회합니다. 냉장고 파먹기 타임!")
    @GetMapping("/my")
    public RsData<List<FoodInventoryResponseDto>> getFoodInventories(HttpServletRequest request) {
        Long userId = tokenService.getIdFromToken();
        List<FoodInventoryResponseDto> responseDtos = foodInventoryService.getFoodInventories(userId);
        return new RsData<>("200", "사용자별 식품 재고 목록이 성공적으로 조회되었습니다.", responseDtos);
    }

    @Operation(summary = "카테고리별 식품 재고 목록 조회", description = "특정 카테고리에 속하는 식품 재고 목록을 조회합니다. 오늘은 어떤 종류의 재료를 사용해볼까요?")
    @GetMapping("/category/{categoryId}")
    public RsData<List<FoodInventoryResponseDto>> getFoodInventoriesByCategory(HttpServletRequest request, @PathVariable Long categoryId) {
        Long userId = tokenService.getIdFromToken();
        List<FoodInventoryResponseDto> responseDtos = foodInventoryService.getFoodInventoriesByCategory(userId, categoryId);
        return new RsData<>("200", "카테고리별 식품 재고 목록이 성공적으로 조회되었습니다.", responseDtos);
    }

    @Operation(summary = "식품 재고 수정", description = "기존 식품 재고 정보를 수정합니다. 앗! 잘못샀네!")
    @PutMapping("/")
    public RsData<FoodInventoryResponseDto> updateFoodInventory(@RequestBody UpdateFoodInventoryRequestDto requestDto) {

        Long userId = tokenService.getIdFromToken();

        FoodInventoryResponseDto responseDto = foodInventoryService.updateFoodInventory(userId, requestDto);
        return new RsData<>("200", "식품 재고가 성공적으로 수정되었습니다.", responseDto);
    }

    // 식품 재고 수량만 수정하는 엔드포인트 추가
    @Operation(summary = "식품 재고 수량 수정", description = "기존 식품 재고의 수량만 수정합니다.")
    @PatchMapping("/{foodInventoryId}/quantity")
    public RsData<FoodInventoryResponseDto> updateFoodInventoryQuantity(@PathVariable Long foodInventoryId, @RequestBody UpdateFoodInventoryQuantityRequestDto requestDto) {

        Long userId = tokenService.getIdFromToken();

        FoodInventoryResponseDto responseDto = foodInventoryService.updateFoodInventoryQuantity(userId, foodInventoryId, requestDto);
        return new RsData<>("200", "식품 재고 수량이 성공적으로 수정되었습니다.", responseDto);
    }

    @Operation(summary = "식품 재고 삭제", description = "식품 재고를 삭제합니다. 다 먹었다!")
    @DeleteMapping("/{foodInventoryId}")
    public RsData<?> deleteFoodInventory(@PathVariable Long foodInventoryId) {

        Long userId = tokenService.getIdFromToken();

        foodInventoryService.deleteFoodInventory(userId,foodInventoryId);
        return new RsData<>("200", "식품 재고가 성공적으로 삭제되었습니다.");
    }

    @GetMapping("/expiring-soon")
    public RsData<?> getExpiringSoon(
            @CurrentUser SecurityUser securityUser
            ){

        List<ExpiringSoonResponseDto> response = foodInventoryService.getExpiringSoon(securityUser.getId());

        return new RsData<>("200", "유통기한이 임박한 식품 조회에 성공하였습니다.", response);
    }
}

