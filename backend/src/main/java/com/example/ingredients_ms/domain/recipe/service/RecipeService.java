package com.example.ingredients_ms.domain.recipe.service;

import com.example.ingredients_ms.domain.recipe.dto.request.CreateRecipeRequestDto;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipe.entity.RecipeType;
import com.example.ingredients_ms.domain.recipe.repository.RecipeRepository;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import com.example.ingredients_ms.global.rsdata.RsData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserService userService;

    @Transactional
    public RsData<?> createService(Long userId, CreateRecipeRequestDto requestDto){

        // 유저 찾기
        Optional<User> opUser = userService.findUserById(userId);

        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        // 레시피 정보 저장
        Recipe recipe = Recipe.builder()
                .description(requestDto.getDescription())
                .title(requestDto.getTitle())
                .isPublic(requestDto.isPublic())
                .cookingTime(requestDto.getCookingTime())
                .servings(requestDto.getServing())
                .difficultyLevel(requestDto.getDifficultyLevel())
                .recipeType(RecipeType.fromValue(requestDto.getRecipeType()))
                .imageUrl(requestDto.getImageUrl())
                .author(user)
                .build();

        // 저장
        recipeRepository.save(recipe);

        return new RsData<>("200","레시피가 생성되었습니다.");
    }


//    public RsData<?> findAllRecipe(){
//
//
//    }


}
