package com.example.ingredients_ms.domain.recipe.service;

import com.example.ingredients_ms.domain.image.dto.ImageUploadResponseDto;
import com.example.ingredients_ms.domain.image.service.ImageFolderType;
import com.example.ingredients_ms.domain.image.service.ImageService;
import com.example.ingredients_ms.domain.recipe.dto.request.CreateRecipeRequestDto;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipe.entity.RecipeType;
import com.example.ingredients_ms.domain.recipe.repository.RecipeRepository;
import com.example.ingredients_ms.domain.recipeingredient.service.RecipeIngredientService;
import com.example.ingredients_ms.domain.recipestep.service.RecipeStepService;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import com.example.ingredients_ms.global.rsdata.RsData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
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


//    public RsData<?> findAllRecipe(){
//
//
//    }


}
