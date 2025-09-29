package com.example.ingredients_ms.domain.recipeingredient.service;

import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredients.service.IngredientsService;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipeingredient.dto.request.CreateRecipeIngredientsRequestDto;
import com.example.ingredients_ms.domain.recipeingredient.dto.response.RecipeIngredientResponseDto;
import com.example.ingredients_ms.domain.recipeingredient.entity.RecipeIngredient;
import com.example.ingredients_ms.domain.recipeingredient.repository.RecipeIngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeIngredientService {

    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientsService ingredientsService;

    public void createRecipeIngredient(List<CreateRecipeIngredientsRequestDto> requestDto, Recipe recipe){

        for(CreateRecipeIngredientsRequestDto ingredientDto : requestDto) {

            Ingredients ingredients = ingredientsService.findById(ingredientDto.getIngredientId());
            String notes = ingredientDto.getNotes();

            RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                    .recipe(recipe)
                    .ingredient(ingredients)
                    .notes(notes == null || notes.isEmpty() ? null : ingredientDto.getNotes())
                    .unit(ingredientDto.getUnit())
                    .quantity(ingredientDto.getQuantity())
                .build();

            recipeIngredientRepository.save(recipeIngredient);
        }
    }

    public List<RecipeIngredientResponseDto> findRecipeIngredientByRecipeId(Long recipeId){

        return recipeIngredientRepository.findByRecipeId(recipeId).stream().map(ingredient -> RecipeIngredientResponseDto.builder()
                        .ingredientName(ingredient.getIngredient().getName())
                        .unit(ingredient.getUnit())
                        .notes(ingredient.getNotes())
                        .quantity(ingredient.getQuantity())
                .build())
                .toList();
    }
}
