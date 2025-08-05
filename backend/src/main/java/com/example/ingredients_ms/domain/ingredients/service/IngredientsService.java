package com.example.ingredients_ms.domain.ingredients.service;

import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import com.example.ingredients_ms.domain.exeption.ExceptionCode;
import com.example.ingredients_ms.domain.ingredients.dto.request.CreateIngredientRequestDto;
import com.example.ingredients_ms.domain.ingredients.dto.response.IngredientResponseDto;
import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredients.repository.IngredientsRepository;
import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import com.example.ingredients_ms.domain.ingredientscategory.repository.IngredientsCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IngredientsService {

    private final IngredientsRepository ingredientsRepository;
    private final IngredientsCategoryRepository ingredientsCategoryRepository;

    @Transactional
    public IngredientResponseDto createIngredient(CreateIngredientRequestDto requestDto) {

        if (ingredientsRepository.existsByName(requestDto.getName())) {
            throw new BusinessLogicException(ExceptionCode.DUPLICATE_INGREDIENT);
        }

        IngredientsCategory category = ingredientsCategoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        Ingredients ingredient = Ingredients.builder()
                .name(requestDto.getName())
                .category(category)
                .build();

        Ingredients savedIngredient = ingredientsRepository.save(ingredient);

        return IngredientResponseDto.fromEntity(savedIngredient);
    }

    public IngredientResponseDto getIngredient(Long ingredientId) {

        Ingredients ingredient = ingredientsRepository.findById(ingredientId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.INGREDIENT_NOT_FOUND));

        return IngredientResponseDto.fromEntity(ingredient);
    }


    public List<IngredientResponseDto> getAllIngredients() {

        // 일단 DB가 비어있을 때 오류가 발생하진 않음.
        return ingredientsRepository.findAllByOrderById().stream()
                .map(IngredientResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<IngredientResponseDto> getIngredientsByCategory(Long categoryId) {
        IngredientsCategory category = ingredientsCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        return ingredientsRepository.findByCategoryOrderById(category).stream()
                .map(IngredientResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public IngredientResponseDto updateIngredient(Long ingredientId, CreateIngredientRequestDto requestDto) {

        // 식재료 존재여부 확인
        Ingredients ingredient = ingredientsRepository.findById(ingredientId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.INGREDIENT_NOT_FOUND));
        // 식재료명 중복 검사
        if (ingredientsRepository.existsByName(requestDto.getName())) {
            throw new BusinessLogicException(ExceptionCode.DUPLICATE_INGREDIENT);
        }
        // 카테고리 존재여부 확인
        IngredientsCategory category = ingredientsCategoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        ingredient.setName(requestDto.getName());
        ingredient.setCategory(category);

        Ingredients updatedIngredient = ingredientsRepository.save(ingredient);

        return IngredientResponseDto.fromEntity(updatedIngredient);
    }


    @Transactional
    public void deleteIngredient(Long ingredientId) {
        if (!ingredientsRepository.existsById(ingredientId)) {
            throw new BusinessLogicException(ExceptionCode.INGREDIENT_NOT_FOUND);
        }
        ingredientsRepository.deleteById(ingredientId);
    }

    // ID를 통해 식재료 찾기
    public Ingredients findById(long id) {

        Ingredients ingredient = ingredientsRepository.findById(id);
        if (ingredient == null) {
            throw new BusinessLogicException(ExceptionCode.INGREDIENT_NOT_FOUND);
        }

        return ingredientsRepository.findById(id);
    }
}