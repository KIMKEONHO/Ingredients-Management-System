package com.example.ingredients_ms.domain.recipe.controller;

import com.example.ingredients_ms.domain.recipe.dto.request.CreateRecipeRequestDto;
import com.example.ingredients_ms.domain.recipe.service.RecipeService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipe")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RsData<?> createRecipe(
            @CurrentUser SecurityUser securityUser,
            @RequestPart("recipeData") CreateRecipeRequestDto requestDto,
            @RequestPart(value = "recipeImage", required = false) MultipartFile recipeImage,
            @RequestPart(value = "stepImages", required = false) List<MultipartFile> stepImages
    ) {
        return recipeService.createRecipePost(securityUser.getId(), requestDto, recipeImage, stepImages);
    }

//    @GetMapping("/all")
//    public RsData<?> findAllRecipe(){
//
//        return recipeService.findAllRecipe();
//    }
}
