package com.example.ingredients_ms.domain.reciperecommendation.controller;

import com.example.ingredients_ms.domain.reciperecommendation.dto.response.RecipeRecommendationResponseDto;
import com.example.ingredients_ms.domain.reciperecommendation.service.RecipeRecommendationService;
import com.example.ingredients_ms.global.jwt.TokenService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipe/recommend")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "레시피 추천 API", description = "사용자 식품 재고 기반 레시피 추천을 위한 API")
public class RecipeRecommedationController {

    private final RecipeRecommendationService recipeRecommandationService;
    private final TokenService tokenService;


    @GetMapping("/")
    @Operation(summary = "사용자별 레시피 추천", description = "사용자의 식품 재고를 기반으로 만들 수 있는 레시피를 추천합니다.")
    public RsData<List<RecipeRecommendationResponseDto>> getRecipeRecommendations(){

        Long userId = tokenService.getIdFromToken();
        
        log.info("사용자 ID {}에 대한 레시피 추천 요청", userId);
        
        List<RecipeRecommendationResponseDto> recommendations =
                recipeRecommandationService.getRecipeRecommendations(userId);
        
        log.info("사용자 ID {}에 대한 레시피 추천 완료. 추천된 레시피 수: {}", userId, recommendations.size());
        
        return new RsData<>("200", "레시피 추천을 완료했습니다.", recommendations);
    }
}