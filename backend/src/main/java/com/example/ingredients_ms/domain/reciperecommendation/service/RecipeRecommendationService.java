package com.example.ingredients_ms.domain.reciperecommendation.service;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.repository.FoodInventoryRepository;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipe.repository.RecipeRepository;
import com.example.ingredients_ms.domain.reciperecommendation.dto.response.RecipeRecommendationResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeRecommendationService {

    private final FoodInventoryRepository foodInventoryRepository;
    private final RecipeRepository recipeRepository;

    /**
     * 사용자의 식품 재고를 기반으로 레시피를 추천합니다.
     * @param userId 사용자 ID
     * @return 추천 레시피 목록
     */
    public List<RecipeRecommendationResponseDto> getRecipeRecommendations(Long userId) {
        // 1. 사용자의 식품 재고 목록 조회
        List<FoodInventory> userInventories = foodInventoryRepository.findByUser_IdOrderById(userId);
        
        // 2. 보유한 재료의 ID 목록 추출
        List<Long> ingredientIds = userInventories.stream()
                .map(inventory -> inventory.getIngredient().getId())
                .distinct()
                .collect(Collectors.toList());
        
        // 3. 보유한 재료로만 만들 수 있는 레시피 조회
        List<Recipe> availableRecipes = recipeRepository.findRecipesByAvailableIngredients(ingredientIds);
        
        // 4. Recipe 엔티티를 RecipeRecommandationResponseDto로 변환
        return availableRecipes.stream()
                .map(RecipeRecommendationResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}