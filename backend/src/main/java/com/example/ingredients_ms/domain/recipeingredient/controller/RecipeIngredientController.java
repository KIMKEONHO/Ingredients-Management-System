package com.example.ingredients_ms.domain.recipeingredient.controller;

import com.example.ingredients_ms.domain.recipeingredient.service.RecipeIngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recipe/ingredient")
@RequiredArgsConstructor
public class RecipeIngredientController {

    private final RecipeIngredientService recipeIngredientService;

}
