package com.example.ingredients_ms.domain.foodinventory.service;


import com.example.ingredients_ms.domain.foodinventory.dto.request.CreateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.request.UpdateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.ExpiringSoonResponseDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.FoodInventoryResponseDto;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus;
import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import com.example.ingredients_ms.domain.foodinventory.repository.FoodInventoryRepository;
import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredients.repository.IngredientsRepository;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
// 냉장고 관리의 핵심! FoodInventoryService 입니다.
public class FoodInventoryService {

    private final FoodInventoryRepository foodInventoryRepository;
    private final UserRepository userRepository;
    private final IngredientsRepository ingredientsRepository;

    // 새로운 재료를 냉장고에 등록합니다. 환영 파티라도 열어야 할까요?
    @Transactional
    public FoodInventoryResponseDto createFoodInventory(Long userId, CreateFoodInventoryRequestDto requestDto) {
        //유저 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        //식재료 찾기
        Ingredients ingredient = ingredientsRepository.findById(requestDto.getIngredientId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.INGREDIENT_NOT_FOUND));

        //저장할 재고 객체 생성
        FoodInventory foodInventory = FoodInventory.builder()
                .quantity(requestDto.getQuantity())
                .unit(requestDto.getUnit())
                .boughtDate(requestDto.getBoughtDate())
                .expirationDate(requestDto.getExpirationDate())
                .places(requestDto.getPlaces())
                .originalQuantity(requestDto.getQuantity())
                .user(user)
                .ingredient(ingredient)
                .build();

        // 저장
        FoodInventory savedFoodInventory = foodInventoryRepository.save(foodInventory);
        return FoodInventoryResponseDto.fromEntity(savedFoodInventory);
    }

    @Transactional
    public List<FoodInventoryResponseDto> getFoodInventoriesByPlace(Long userId, String placeName){

        Place place = Place.valueOf(placeName.toUpperCase());

        List<FoodInventory> inventories = foodInventoryRepository.findByUser_IdAndPlaces(userId,place);

        // places 미리 초기화
        inventories.forEach(inventory -> inventory.getPlaces().size());

        // 엔티티(객체)를 Dto로 변환하여 반환
        return inventories.stream()
                .map(FoodInventoryResponseDto::fromEntity)
                .collect(Collectors.toList());

    }


    // 냉장고 안의 모든 식재료를 조회합니다. 뭐가 있는지 한번 볼까요?
    @Transactional
    public List<FoodInventoryResponseDto> getFoodInventories(Long userId) {

        List<FoodInventory> inventories = foodInventoryRepository.findByUser_IdOrderById(userId);

        // places 미리 초기화
        inventories.forEach(inventory -> inventory.getPlaces().size());

        return inventories.stream()
                .map(FoodInventoryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 특정 카테고리의 식재료만 필터링해서 보여줍니다. 오늘은 어떤 요리를 해볼까요?
    @Transactional
    public List<FoodInventoryResponseDto> getFoodInventoriesByCategory(Long userId, Long categoryId) {

        return foodInventoryRepository.findByUser_IdAndIngredient_Category_IdOrderById(userId, categoryId).stream()
                .map(FoodInventoryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 기존 식재료의 정보를 수정합니다. 양이 늘거나 유통기한이 바뀌었나요?
    @Transactional
    public FoodInventoryResponseDto updateFoodInventory(Long userId,UpdateFoodInventoryRequestDto requestDto) {

        FoodInventory foodInventory = foodInventoryRepository.findByUser_IdAndId(userId, requestDto.getFoodInventoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.FOOD_INVENTORY_NOT_FOUND));

        // 저장할 객체에 값 할당
        foodInventory.setQuantity(requestDto.getQuantity());
        foodInventory.setUnit(requestDto.getUnit());
        foodInventory.setBoughtDate(requestDto.getBoughtDate());
        foodInventory.setExpirationDate(requestDto.getExpirationDate());
        foodInventory.setPlaces(requestDto.getPlaces());

        FoodInventory updatedFoodInventory = foodInventoryRepository.save(foodInventory);
        return FoodInventoryResponseDto.fromEntity(updatedFoodInventory);
    }

    // 다 쓴 식재료는 냉장고에서 비워줍니다. 안녕...
    @Transactional
    public void deleteFoodInventory(Long userId, Long foodInventoryId) {

        // 사용자가 추가한 식품 재고중에 존재하는지 확인
        if (!foodInventoryRepository.existsByUser_IdAndId(userId,foodInventoryId)) {
            throw new BusinessLogicException(ExceptionCode.FOOD_INVENTORY_NOT_FOUND);
        }

        foodInventoryRepository.deleteById(foodInventoryId);
    }

    @Transactional
    public List<ExpiringSoonResponseDto> getExpiringSoon(Long userId) {
        List<FoodInventory> inventories = foodInventoryRepository.findByUser_IdAndStatus(userId, FoodStatus.EXPIRING_SOON);
        
        inventories.forEach(inventory -> inventory.getPlaces().size());
        
        return inventories.stream()
                .map(i -> ExpiringSoonResponseDto.builder()
                        .ingredientsName(i.getIngredient().getName())
                        .quantity(i.getQuantity())
                        .places(i.getPlaces())
                        .unit(i.getUnit())
                        .expirationDate(i.getExpirationDate())
                        .boughtDate(i.getBoughtDate())
                        .build())
                .toList();
    }
}
