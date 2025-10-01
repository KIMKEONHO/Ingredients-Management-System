package com.example.ingredients_ms.domain.recipe.service;

import com.example.ingredients_ms.domain.image.dto.ImageUploadResponseDto;
import com.example.ingredients_ms.domain.image.service.ImageFolderType;
import com.example.ingredients_ms.domain.image.service.ImageService;
import com.example.ingredients_ms.domain.recipe.dto.request.CreateRecipeRequestDto;
import com.example.ingredients_ms.domain.recipe.dto.response.AllRecipeResponseDto;
import com.example.ingredients_ms.domain.recipe.dto.response.RecipeDetailResponseDto;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipe.entity.RecipeType;
import com.example.ingredients_ms.domain.recipe.repository.RecipeRepository;
import com.example.ingredients_ms.domain.recipeingredient.dto.response.RecipeIngredientResponseDto;
import com.example.ingredients_ms.domain.recipeingredient.service.RecipeIngredientService;
import com.example.ingredients_ms.domain.recipestep.dto.response.RecipeStepResponseDto;
import com.example.ingredients_ms.domain.recipestep.service.RecipeStepService;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import com.example.ingredients_ms.global.rsdata.RsData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserService userService;
    private final RecipeIngredientService recipeIngredientService;
    private final RecipeStepService recipeStepService;
    private final ImageService imageService;

    /**
     * 레시피 게시글(레시피, 레시피 재료, 레시피 단계) 생성 로직
     *
     * @param userId    레시피 작성자 ID
     * @param requestDto 레시피 생성 요청 데이터
     * @return RsData 결과 응답 객체
     * @throws BusinessLogicException USER_NOT_FOUND 예외 (사용자가 존재하지 않는 경우)
     * @since 2025.09.24
     */
    @Transactional
    public RsData<?> createRecipePost(Long userId, CreateRecipeRequestDto requestDto, MultipartFile recipeImage, List<MultipartFile> stepImages){

        // 유저 찾기
        Optional<User> opUser = userService.findUserById(userId);

        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();
        String recipeImageUrl = null;

        // 레시피 메인 이미지 업로드
        if (recipeImage != null && !recipeImage.isEmpty()) {
            RsData<ImageUploadResponseDto> uploadResult = imageService.uploadImage(recipeImage, ImageFolderType.RECIPE_MAIN);
            recipeImageUrl = uploadResult.getData().getImageUrl();
        }

        // 레시피 정보 저장
        Recipe recipe = Recipe.builder()
                .description(requestDto.getDescription())
                .title(requestDto.getTitle())
                .isPublic(requestDto.isPublic())
                .cookingTime(requestDto.getCookingTime())
                .servings(requestDto.getServing())
                .difficultyLevel(requestDto.getDifficultyLevel())
                .recipeType(RecipeType.fromValue(requestDto.getRecipeType()))
                .imageUrl(recipeImageUrl)
                .author(user)
                .build();

        // 저장
        recipeRepository.save(recipe);

        // 레시피 재료 저장
        recipeIngredientService.createRecipeIngredient(requestDto.getIngredientsRequestDto(), recipe);

        // 레시피 단계 저장
        recipeStepService.createRecipeStep(requestDto.getStepRequestDto(), recipe, stepImages);

        return new RsData<>("200","레시피가 생성되었습니다.");
    }


    @Transactional
    public RsData<?> findAllRecipe(){

        List<Recipe> recipes = recipeRepository.findAll();

        List<AllRecipeResponseDto> response = recipes.stream().map(recipe ->
                        AllRecipeResponseDto.builder()
                                .recipeId(recipe.getId())
                        .createdAt(recipe.getCreatedAt())
                                .recipeIngredientResponseDto(recipeIngredientService.findRecipeIngredientByRecipeId(recipe.getId()))
                        .userNickName(recipe.getAuthor().getUserName())
                        .description(recipe.getDescription())
                        .title(recipe.getTitle())
                        .difficultyLevel(recipe.getDifficultyLevel())
                        .userProfile(recipe.getAuthor().getProfileUrl())
                        .cookingTime(recipe.getCookingTime())
                                .imageUrl(recipe.getImageUrl())
                                .viewCount(recipe.getViewCount())
                                .likeCount(recipe.getLikeCount().intValue())//좋아요 카운트
                        .build())
                .toList();

        return new RsData<>("200","모든 레시피를 찾았습니다.", response);
    }

    @Transactional
    public RsData<?> findRecipeById(Long recipeId){

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.RECIPE_NOT_FOUND));

        increaseViewCount(recipeId);

        List<RecipeIngredientResponseDto> ingredients = recipeIngredientService.findRecipeIngredientByRecipeId(recipeId);

        List<RecipeStepResponseDto> steps = recipeStepService.findRecipeStepByRecipeId(recipeId);

        RecipeDetailResponseDto response = RecipeDetailResponseDto.builder()
                .userId(recipe.getAuthor().getId())
                .cookingTime(recipe.getCookingTime())
                .createdAt(recipe.getCreatedAt())
                .description(recipe.getDescription())
                .difficultyLevel(recipe.getDifficultyLevel())
                .imageUrl(recipe.getImageUrl())
                .likeCount(recipe.getLikeCount())
                .profileUrl(recipe.getAuthor().getProfileUrl())
                .userNickName(recipe.getAuthor().getNickname())
                .viewCount(recipe.getViewCount())
                .title(recipe.getTitle())
                .servings(recipe.getServings())
                .recipeType(recipe.getRecipeType())
                .recipeIngredientResponseDtos(ingredients)
                .recipeStepResponseDtos(steps)
                .build();



        return new RsData<>("200","해당 레시피를 찾았습니다.", response);
    }

    /**
     * 조회수 증가를 별도 트랜잭션으로 처리
     * @param recipeId 레시피 ID
     */
    @Transactional
    public void increaseViewCount(Long recipeId) {
        log.info("조회수 증가 메서드 호출 - recipeId: {}", recipeId);
        recipeRepository.incrementViewCount(recipeId);
        log.info("조회수 증가 완료 - recipeId: {}", recipeId);
    }

    @Transactional
    public RsData<?> deleteRecipe(Long recipeId, Long userId){

        Optional<Recipe> opRecipe = recipeRepository.findById(recipeId);

        if(opRecipe.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.RECIPE_NOT_FOUND);
        }

        if(!opRecipe.get().getAuthor().getId().equals(userId)){
            throw new BusinessLogicException(ExceptionCode.NOT_OWNER);
        }

        Recipe recipe = opRecipe.get();

        // 레시피 메인 이미지를 S3에서 삭제
        if (recipe.getImageUrl() != null && !recipe.getImageUrl().isEmpty()) {
            try {
                String fileName = extractFileNameFromUrl(recipe.getImageUrl());
                if (fileName != null) {
                    imageService.deleteImage(fileName, ImageFolderType.RECIPE_MAIN);
                    log.info("레시피 메인 이미지 삭제 완료: {}", fileName);
                }
            } catch (Exception e) {
                log.error("레시피 메인 이미지 삭제 실패: {}", recipe.getImageUrl(), e);
                // 이미지 삭제 실패해도 레시피 삭제는 계속 진행
            }
        }

        // 레시피 재료 모두 삭제
        recipeIngredientService.deleteRecipeIngredientByRecipeId(recipeId);

        // 레시피 단계 모두 삭제
        recipeStepService.deleteRecipeStepByRecipeId(recipeId);

        // 레시피 삭제
        recipeRepository.deleteById(recipeId);

        return new RsData<>("204", "레시피가 삭제되었습니다.");
    }
    
    /**
     * S3 URL에서 파일명을 추출합니다.
     * @param imageUrl S3 이미지 URL
     * @return 파일명
     */
    private String extractFileNameFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        try {
            // URL에서 마지막 '/' 이후의 부분이 파일명
            int lastSlashIndex = imageUrl.lastIndexOf('/');
            if (lastSlashIndex != -1 && lastSlashIndex < imageUrl.length() - 1) {
                return imageUrl.substring(lastSlashIndex + 1);
            }
        } catch (Exception e) {
            log.error("URL에서 파일명 추출 실패: {}", imageUrl, e);
        }
        
        return null;
    }

}
