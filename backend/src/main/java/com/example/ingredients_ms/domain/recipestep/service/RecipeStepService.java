package com.example.ingredients_ms.domain.recipestep.service;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipestep.dto.request.CreateRecipeStepRequestDto;
import com.example.ingredients_ms.domain.recipestep.entity.RecipeStep;
import com.example.ingredients_ms.domain.recipestep.repository.RecipeStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeStepService {

    private final RecipeStepRepository recipeStepRepository;

    public void createRecipeStep(List<CreateRecipeStepRequestDto> requestDto, Recipe recipe){

        for(CreateRecipeStepRequestDto recipeStepRequestDto : requestDto){

            RecipeStep recipeStep = RecipeStep.builder()
                    .stepNumber(recipeStepRequestDto.getStepNumber())
                    .description(recipeStepRequestDto.getDescription())
                    .cookingTime(recipeStepRequestDto.getCookingTime())
                    .imageUrl(recipeStepRequestDto.getImageUrl())
                    .recipe(recipe)
                    .build();

            recipeStepRepository.save(recipeStep);
        }


    }


}
