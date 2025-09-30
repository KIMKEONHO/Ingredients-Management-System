package com.example.ingredients_ms.domain.recipestep.service;

import com.example.ingredients_ms.domain.image.dto.ImageUploadResponseDto;
import com.example.ingredients_ms.domain.image.service.ImageFolderType;
import com.example.ingredients_ms.domain.image.service.ImageService;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipestep.dto.request.CreateRecipeStepRequestDto;
import com.example.ingredients_ms.domain.recipestep.dto.response.RecipeStepResponseDto;
import com.example.ingredients_ms.domain.recipestep.entity.RecipeStep;
import com.example.ingredients_ms.domain.recipestep.repository.RecipeStepRepository;
import com.example.ingredients_ms.global.rsdata.RsData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
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

    public List<RecipeStepResponseDto> findRecipeStepByRecipeId(Long recipeId){

        return recipeStepRepository.findByRecipeId(recipeId).stream().map(recipeStep -> RecipeStepResponseDto.builder()
                        .stepNumber(recipeStep.getStepNumber())
                        .description(recipeStep.getDescription())
                        .imageUrl(recipeStep.getImageUrl())
                        .cookingTime(recipeStep.getCookingTime())
                        .build())
                .toList();
    }

    public void deleteRecipeStepByRecipeId(Long recipeId){

        List<RecipeStep> recipeSteps = recipeStepRepository.findByRecipeId(recipeId);

        // 각 레시피 단계의 이미지를 S3에서 삭제
        for (RecipeStep recipeStep : recipeSteps) {
            if (recipeStep.getImageUrl() != null && !recipeStep.getImageUrl().isEmpty()) {
                try {
                    // S3 URL에서 파일명 추출
                    String fileName = extractFileNameFromUrl(recipeStep.getImageUrl());
                    if (fileName != null) {
                        imageService.deleteImage(fileName, ImageFolderType.RECIPE_STEP);
                        log.info("레시피 단계 이미지 삭제 완료: {}", fileName);
                    }
                } catch (Exception e) {
                    log.error("레시피 단계 이미지 삭제 실패: {}", recipeStep.getImageUrl(), e);
                    // 이미지 삭제 실패해도 DB 삭제는 계속 진행
                }
            }
        }

        recipeStepRepository.deleteByRecipe_Id(recipeId);
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
