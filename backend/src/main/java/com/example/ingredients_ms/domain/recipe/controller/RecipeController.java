package com.example.ingredients_ms.domain.recipe.controller;

import com.example.ingredients_ms.domain.recipe.dto.request.CreateRecipeRequestDto;
import com.example.ingredients_ms.domain.recipe.service.RecipeService;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.domain.useractivity.service.UserActivityService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipe")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final UserActivityService userActivityService;
    private final UserRepository userRepository;

    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RsData<?> createRecipe(
            @CurrentUser SecurityUser securityUser,
            @RequestPart("recipeData") CreateRecipeRequestDto requestDto,
            @RequestPart(value = "recipeImage", required = false) MultipartFile recipeImage,
            @RequestPart(value = "stepImages", required = false) List<MultipartFile> stepImages
    ) {
        RsData<?> result = recipeService.createRecipePost(securityUser.getId(), requestDto, recipeImage, stepImages);
        
        // 레시피 생성 활동 로그 기록
        if (result.getResultCode().startsWith("2")) { // 성공 시
            User user = userRepository.findById(securityUser.getId()).orElse(null);
            if (user != null) {
                userActivityService.logRecipeCreate(user, 0L, requestDto.getTitle()); // recipeId는 생성 후에 알 수 있음
            }
        }
        
        return result;
    }

    @GetMapping("/all")
    public RsData<?> findAllRecipe(){
        return recipeService.findAllRecipe();
    }

    @GetMapping("/detail/{recipeId}")
    public RsData<?> recipeDetail(@PathVariable("recipeId") Long recipeId, @CurrentUser SecurityUser securityUser){
        // 레시피 조회 활동 로그 기록
        if (securityUser != null) {
            User user = userRepository.findById(securityUser.getId()).orElse(null);
            if (user != null) {
                // 레시피 제목을 가져오기 위해 임시로 "레시피 조회"로 설정
                // 실제로는 RecipeService에서 레시피 정보를 가져와서 제목을 사용해야 함
                userActivityService.logRecipeView(user, recipeId, "레시피 조회");
            }
        }
        
        return recipeService.findRecipeById(recipeId);
    }

    @DeleteMapping("/{recipeId}")
    public RsData<?> deleteRecipe(@PathVariable("recipeId") Long recipeId, @CurrentUser SecurityUser securityUser){
        return recipeService.deleteRecipe(recipeId,securityUser.getId());
    }
}
