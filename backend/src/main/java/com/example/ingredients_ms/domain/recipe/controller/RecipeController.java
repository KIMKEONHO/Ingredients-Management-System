package com.example.ingredients_ms.domain.recipe.controller;

import com.example.ingredients_ms.domain.recipe.dto.request.CreateRecipeRequestDto;
import com.example.ingredients_ms.domain.recipe.service.RecipeService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recipe")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @PostMapping("/")
    public RsData<?> createRecipe(
            @CurrentUser SecurityUser securityUser,
            @RequestBody CreateRecipeRequestDto requestDto
            ){

        return recipeService.createRecipePost(securityUser.getId(), requestDto);
    }

//    @GetMapping("/all")
//    public RsData<?> findAllRecipe(){
//
//        return recipeService.findAllRecipe();
//    }
}
