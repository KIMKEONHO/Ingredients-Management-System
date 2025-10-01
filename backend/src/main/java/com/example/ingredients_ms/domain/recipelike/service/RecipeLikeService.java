package com.example.ingredients_ms.domain.recipelike.service;


import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipe.repository.RecipeRepository;
import com.example.ingredients_ms.domain.recipelike.dto.response.RecipeLikeResponseDto;
import com.example.ingredients_ms.domain.recipelike.entity.RecipeLike;
import com.example.ingredients_ms.domain.recipelike.repository.RecipeLikeRepository;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import com.example.ingredients_ms.global.jwt.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeLikeService {



    private final RecipeLikeRepository recipeLikeRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    private final TokenService tokenService;


    /**
     * 사용자가 레시피에 '좋아요'를 추가합니다.
     * - 한 번도 '좋아요'를 누른 적 없다면 새로 생성합니다.
     * - 이전에 '좋아요'를 눌렀다가 취소한 상태라면 다시 활성화합니다.
     * - 이미 '좋아요'가 활성화된 상태라면 예외를 발생시킵니다.
     *
     * @param userId   사용자 ID
     * @param recipeId 레시피 ID
     * @return RecipeLikeResponseDto 최종 '좋아요' 상태와 개수
     */
    @Transactional
    public RecipeLikeResponseDto like(Long userId, Long recipeId) {
        // 1. User와 Recipe 엔티티를 조회합니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.RECIPE_NOT_FOUND));

        // 2. 기존 '좋아요' 기록을 조회합니다.
        Optional<RecipeLike> likeOptional = recipeLikeRepository.findByUserAndRecipe(user, recipe);

        if (likeOptional.isPresent()) {
            // 기록이 있는 경우
            RecipeLike existingLike = likeOptional.get();
            if (existingLike.getIsActive()) {
                // 이미 '좋아요' 상태일 경우 -> 예외 발생
                throw new BusinessLogicException(ExceptionCode.LIKE_ALREADY_EXISTS);
            }
            existingLike.reactivateLike();
        } else {
            // 기록이 없는 경우 -> 새로 생성
            recipeLikeRepository.save(RecipeLike.builder()
                    .user(user)
                    .recipe(recipe)
                    .build());
        }

        // 3. 최종 '좋아요' 개수를 계산
        recipe.increaseLikeCount();

        return RecipeLikeResponseDto.builder()
                .isActive(true)
                .likeCount(recipe.getLikeCount())
                .build();
    }

    /**
     * 사용자가 레시피의 '좋아요'를 취소합니다.
     * - '좋아요'가 활성화된 상태일 때만 비활성화(취소) 처리합니다.
     * - '좋아요'를 누른 기록이 없거나 이미 취소된 상태라면 예외를 발생시킵니다.
     *
     * @param userId   사용자 ID
     * @param recipeId 레시피 ID
     * @return RecipeLikeResponseDto 최종 '좋아요' 상태와 개수
     */
    @Transactional
    public RecipeLikeResponseDto unlike(Long userId, Long recipeId) {
        // 1. User와 Recipe 엔티티를 조회합니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.RECIPE_NOT_FOUND));


        // 처음부터 활성화된 '좋아요'만 조회
        RecipeLike existingLike = recipeLikeRepository.findByUserAndRecipeAndIsActiveTrue(user, recipe)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.LIKE_NOT_FOUND)); // '좋아요'가 없거나 이미 취소된 경우


        // 3. '좋아요'를 비활성화(취소)합니다.
        existingLike.cancelLike();


        // COUNT 쿼리 대신 직접 1 감소
        recipe.decreaseLikeCount();

        return RecipeLikeResponseDto.builder()
                .isActive(false)
                .likeCount(recipe.getLikeCount())
                .build();
    }


    @Transactional(readOnly = true)
    public boolean isLiked(Long recipeId) {
        Long userId = tokenService.getIdFromToken();

        // exists... 쿼리를 사용하여 성능 최적화
        return recipeLikeRepository.existsByUser_IdAndRecipe_IdAndIsActiveTrue(userId, recipeId);
    }

}
