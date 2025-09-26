package com.example.ingredients_ms.domain.recipestep.service;

import com.example.ingredients_ms.domain.image.dto.ImageUploadResponseDto;
import com.example.ingredients_ms.domain.image.service.ImageFolderType;
import com.example.ingredients_ms.domain.image.service.ImageService;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipestep.dto.request.CreateRecipeStepRequestDto;
import com.example.ingredients_ms.domain.recipestep.entity.RecipeStep;
import com.example.ingredients_ms.domain.recipestep.repository.RecipeStepRepository;
import com.example.ingredients_ms.global.rsdata.RsData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeStepService {

    private final RecipeStepRepository recipeStepRepository;
    private final ImageService imageService;

    @Transactional
    public void createRecipeStep(List<CreateRecipeStepRequestDto> requestDto, Recipe recipe, List<MultipartFile> stepImages){

        for (int i = 0; i < requestDto.size(); i++) {
            CreateRecipeStepRequestDto stepDto = requestDto.get(i);
            String stepImageUrl = null;

            // 해당 단계의 이미지가 있는지 확인
            if (stepImages != null && i < stepImages.size() &&
                    stepImages.get(i) != null && !stepImages.get(i).isEmpty()) {

                RsData<ImageUploadResponseDto> uploadResult = imageService.uploadImage(stepImages.get(i), ImageFolderType.RECIPE_STEP);
                stepImageUrl = uploadResult.getData().getImageUrl();
            }

            RecipeStep recipeStep = RecipeStep.builder()
                    .stepNumber(stepDto.getStepNumber())
                    .description(stepDto.getDescription())
                    .cookingTime(stepDto.getCookingTime())
                    .imageUrl(stepImageUrl) // 업로드된 이미지 URL 사용
                    .recipe(recipe)
                    .build();

            recipeStepRepository.save(recipeStep);
        }


    }


}
