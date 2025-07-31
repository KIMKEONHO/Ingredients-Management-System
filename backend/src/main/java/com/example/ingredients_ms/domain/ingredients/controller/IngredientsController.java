package com.example.ingredients_ms.domain.ingredients.controller;

import com.example.ingredients_ms.domain.ingredients.dto.request.CreateIngredientRequestDto;
import com.example.ingredients_ms.domain.ingredients.dto.request.UpdateIngredientRequestDto;
import com.example.ingredients_ms.domain.ingredients.dto.response.IngredientResponseDto;
import com.example.ingredients_ms.domain.ingredients.service.IngredientsService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@Tag(name = "식재료 API", description = "식재료 관리를 위한 API")
@RequestMapping("/api/v1/ingredients")
public class IngredientsController {

    private final IngredientsService ingredientsService;

    @Operation(summary = "식재료 추가", description = "새로운 식재료를 목록에 추가합니다.")
    @PostMapping("/")
    public RsData<IngredientResponseDto> createIngredient(@RequestBody CreateIngredientRequestDto requestDto) {
        IngredientResponseDto responseDto = ingredientsService.createIngredient(requestDto);
        return new RsData<>("200", "식재료가 성공적으로 추가되었습니다.", responseDto);
    }

    @Operation(summary = "식재료 조회", description = "ID로 단일 식재료를 조회합니다.")
    @GetMapping("/{ingredientId}")
    public RsData<IngredientResponseDto> getIngredient(@PathVariable Long ingredientId) {
        IngredientResponseDto responseDto = ingredientsService.getIngredient(ingredientId);
        return new RsData<>("200", "식재료가 성공적으로 조회되었습니다.", responseDto);
    }

    @Operation(summary = "모든 식재료 조회", description = "모든 식재료 목록을 조회합니다.")
    @GetMapping("/")
    public RsData<List<IngredientResponseDto>> getAllIngredients() {
        List<IngredientResponseDto> responseDtos = ingredientsService.getAllIngredients();
        return new RsData<>("200", "모든 식재료가 성공적으로 조회되었습니다.", responseDtos);
    }

    @Operation(summary = "식재료 수정", description = "기존 식재료를 수정합니다.")
    @PutMapping("/{ingredientId}")
    public RsData<IngredientResponseDto> updateIngredient(@PathVariable Long ingredientId, @RequestBody UpdateIngredientRequestDto requestDto) {
        IngredientResponseDto responseDto = ingredientsService.updateIngredient(ingredientId, requestDto);
        return new RsData<>("200", "식재료가 성공적으로 수정되었습니다.", responseDto);
    }

    @Operation(summary = "식재료 삭제", description = "목록에서 식재료를 삭제합니다.")
    @DeleteMapping("/{ingredientId}")
    public RsData<?> deleteIngredient(@PathVariable Long ingredientId) {
        ingredientsService.deleteIngredient(ingredientId);
        return new RsData<>("200", "식재료가 성공적으로 삭제되었습니다.", null);
    }
}