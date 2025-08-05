package com.example.ingredients_ms.domain.foodinventory.service;

import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import com.example.ingredients_ms.domain.exeption.ExceptionCode;
import com.example.ingredients_ms.domain.foodinventory.dto.request.CreateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.request.UpdateFoodInventoryRequestDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.FoodInventoryResponseDto;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.repository.FoodInventoryRepository;
import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredients.repository.IngredientsRepository;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
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
    public FoodInventoryResponseDto createFoodInventory(CreateFoodInventoryRequestDto requestDto) {
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        Ingredients ingredient = ingredientsRepository.findById(requestDto.getIngredientId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.INGREDIENT_NOT_FOUND));

        FoodInventory foodInventory = FoodInventory.builder()
                .quantity(requestDto.getQuantity())
                .unit(requestDto.getUnit())
                .boughtDate(requestDto.getBoughtDate())
                .expirationDate(requestDto.getExpirationDate())
                .places(requestDto.getPlaces())
                .user(user)
                .ingredient(ingredient)
                .build();

        FoodInventory savedFoodInventory = foodInventoryRepository.save(foodInventory);
        return FoodInventoryResponseDto.fromEntity(savedFoodInventory);
    }

    // 냉장고 속 특정 재료 하나를 꺼내봅니다. "오늘 저녁은 너로 정했다!"
    public FoodInventoryResponseDto getFoodInventory(Long foodInventoryId) {
        FoodInventory foodInventory = foodInventoryRepository.findById(foodInventoryId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.FOOD_INVENTORY_NOT_FOUND));
        return FoodInventoryResponseDto.fromEntity(foodInventory);
    }

    // 특정 사용자의 냉장고 전체를 훑어봅니다. 뭐가 있나~?
    public List<FoodInventoryResponseDto> getFoodInventories(Long userId) {
        return foodInventoryRepository.findByUser_IdOrderById(userId).stream()
                .map(FoodInventoryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 특정 카테고리의 재료들만 골라봅니다. "오늘은 채소 파티다!"
    public List<FoodInventoryResponseDto> getFoodInventoriesByCategory(Long userId, Long categoryId) {
        return foodInventoryRepository.findByUser_IdAndIngredient_Category_IdOrderById(userId, categoryId).stream()
                .map(FoodInventoryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 재료 정보를 수정합니다. 유통기한 연장의 꿈...은 이루어지지 않습니다.
    @Transactional
    public FoodInventoryResponseDto updateFoodInventory(UpdateFoodInventoryRequestDto requestDto) {
        FoodInventory foodInventory = foodInventoryRepository.findById(requestDto.getFoodInventoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.FOOD_INVENTORY_NOT_FOUND));

        foodInventory.setQuantity(requestDto.getQuantity());
        foodInventory.setUnit(requestDto.getUnit());
        foodInventory.setBoughtDate(requestDto.getBoughtDate());
        foodInventory.setExpirationDate(requestDto.getExpirationDate());
        foodInventory.setPlaces(requestDto.getPlaces());

        FoodInventory updatedFoodInventory = foodInventoryRepository.save(foodInventory);
        return FoodInventoryResponseDto.fromEntity(updatedFoodInventory);
    }

    // 재료를 삭제합니다. 잘가, 즐거웠어...
    @Transactional
    public void deleteFoodInventory(Long foodInventoryId) {
        if (!foodInventoryRepository.existsById(foodInventoryId)) {
            throw new BusinessLogicException(ExceptionCode.FOOD_INVENTORY_NOT_FOUND);
        }
        foodInventoryRepository.deleteById(foodInventoryId);
    }
}
