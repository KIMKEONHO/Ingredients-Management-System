package com.example.ingredients_ms.domain.ingredientscategory.service;


import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import com.example.ingredients_ms.domain.exeption.ExceptionCode;
import com.example.ingredients_ms.domain.ingredientscategory.dto.request.CreateIngredientsCategoryRequestDto;
import com.example.ingredients_ms.domain.ingredientscategory.dto.response.AllIngredientsCategoryResponseDto;
import com.example.ingredients_ms.domain.ingredientscategory.dto.response.IngredientsCategoryResponseDto;
import com.example.ingredients_ms.domain.ingredientscategory.dto.response.UpdateIngredientsCategoryResponseDto;
import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import com.example.ingredients_ms.domain.ingredientscategory.repository.IngredientsCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientsCategoryService {

    private final IngredientsCategoryRepository ingredientsCategoryRepository;

    public List<AllIngredientsCategoryResponseDto> getAllCategory(){

        List<IngredientsCategory> categories = ingredientsCategoryRepository.findAllByOrderById();


        return categories.stream()
                .map(category -> AllIngredientsCategoryResponseDto
                        .fromEntity(category))
                .collect(Collectors.toList());
    }


    @Transactional
    public IngredientsCategoryResponseDto createCategory(CreateIngredientsCategoryRequestDto createIngredientsCategoryRequestDto){

        // 중복 확인
        if (ingredientsCategoryRepository.existsByName(createIngredientsCategoryRequestDto.getName())){
            throw new BusinessLogicException(ExceptionCode.DUPLICATE_CATEGORY);
        }

        // 입력받은 정보를 객체로 변환
        IngredientsCategory ingredientsCategory = IngredientsCategory.builder()
                .name(createIngredientsCategoryRequestDto.getName())
                .build();

        // db에 저장
        IngredientsCategory savedIngredientsCategory = ingredientsCategoryRepository.save(ingredientsCategory);

        //저장된 카테고리에 대한 정보 반환
        return IngredientsCategoryResponseDto.fromEntity(savedIngredientsCategory);
    }

    @Transactional
    public UpdateIngredientsCategoryResponseDto updateCategory(Long id, CreateIngredientsCategoryRequestDto createIngredientsCategoryRequestDto) {

        if (ingredientsCategoryRepository.existsByName(createIngredientsCategoryRequestDto.getName())){
            throw new BusinessLogicException(ExceptionCode.DUPLICATE_CATEGORY);
        }
        IngredientsCategory ingredientsCategory = ingredientsCategoryRepository.findById(id)
                .orElseThrow(()-> new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND));

        ingredientsCategory.setName(createIngredientsCategoryRequestDto.getName());

        IngredientsCategory savedIngredientsCategory = ingredientsCategoryRepository.save(ingredientsCategory);

        return UpdateIngredientsCategoryResponseDto.fromEntity(savedIngredientsCategory);

    }

    @Transactional
    public void deleteCategory(Long id){
        if(!ingredientsCategoryRepository.existsById(id)){
            throw new BusinessLogicException(ExceptionCode.CATEGORY_NOT_FOUND);
        }

        ingredientsCategoryRepository.deleteById(id);

    }
}
