package com.example.ingredients_ms.domain.recipelike.controller;

import com.example.ingredients_ms.domain.recipelike.dto.response.RecipeLikeResponseDto;
import com.example.ingredients_ms.domain.recipelike.service.RecipeLikeService;
import com.example.ingredients_ms.global.jwt.TokenService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Tag(name = "레시피 좋아요 API", description = "레시피 좋아요 관리를 위한 API")
@RequestMapping("/api/v1/recipe")
public class RecipeLikeController {


    private final RecipeLikeService recipeLikeService;
    private final TokenService tokenService;
    /**
     * 레시피에 '좋아요'를 추가하는 API 엔드포인트입니다.
     */
    @Operation(summary = "레시피 좋아요 추가", description = "사용자가 특정 레시피에 '좋아요'를 추가합니다.")
    @PostMapping("/{recipeId}/like")
    public RsData<RecipeLikeResponseDto> likeRecipe(@PathVariable Long recipeId) {
        Long userId = tokenService.getIdFromToken();
        RecipeLikeResponseDto responseDto = recipeLikeService.like(userId, recipeId);

        return new RsData<>("200", "레시피에 좋아요를 추가했습니다.", responseDto);
    }

    /**
     * 레시피의 '좋아요'를 취소하는 API 엔드포인트입니다.
     */
    @Operation(summary = "레시피 좋아요 취소", description = "사용자가 특정 레시피의 '좋아요'를 취소합니다.")
    @DeleteMapping("/{recipeId}/like")
    public RsData<RecipeLikeResponseDto> unlikeRecipe(@PathVariable Long recipeId) {
        Long userId = tokenService.getIdFromToken();
        RecipeLikeResponseDto responseDto = recipeLikeService.unlike(userId, recipeId);

        return new RsData<>("200", "레시피 좋아요를 취소했습니다.", responseDto);
    }

    /**
     * 현재 사용자가 특정 레시피에 '좋아요'를 눌렀는지 확인하는 API 엔드포인트입니다.
     */
    @Operation(summary = "레시피 좋아요 상태 조회", description = "현재 사용자가 특정 레시피를 '좋아요' 했는지 여부를 조회합니다.")
    @GetMapping("/{recipeId}/like")
    public RsData<Boolean> checkIsLiked(@PathVariable Long recipeId) {
        boolean isLiked = recipeLikeService.isLiked(recipeId);

        return new RsData<>("200", "좋아요 상태가 성공적으로 조회되었습니다.", isLiked);
    }



}
