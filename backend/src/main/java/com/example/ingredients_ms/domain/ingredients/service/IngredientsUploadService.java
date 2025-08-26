package com.example.ingredients_ms.domain.ingredients.service;

import com.example.ingredients_ms.domain.ingredients.dto.IngredientDto;
import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredients.repository.IngredientsRepository;
import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import com.example.ingredients_ms.domain.ingredientscategory.repository.IngredientsCategoryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientsUploadService {

    // Repository 변수명을 엔티티에 맞게 수정
    private final IngredientsCategoryRepository ingredientsCategoryRepository;
    private final IngredientsRepository ingredientsRepository;
    private final ObjectMapper objectMapper; // JSON 파싱을 위해 ObjectMapper를 주입받습니다.

    @Transactional
    public void loadIngredientsFromJson() throws IOException {
        // 1. resources/data/ingredients.json 파일을 읽어옵니다.
        ClassPathResource resource = new ClassPathResource("data/ingredients.json");

        try (InputStream inputStream = resource.getInputStream()) {
            // 2. JSON 파일을 List<IngredientDto> 형태로 파싱합니다.
            List<IngredientDto> dtoList = objectMapper.readValue(inputStream, new TypeReference<>() {});

            // 3. DTO 리스트에서 카테고리 데이터를 먼저 저장합니다.
            Map<String, IngredientsCategory> categoryMap = saveCategoriesAndGetMap(dtoList);

            // 4. DTO 리스트를 Ingredients 엔티티 리스트로 변환합니다.
            List<Ingredients> ingredients = dtoList.stream()
                    .map(dto -> {
                        // category나 name이 null이거나 비어있는 데이터는 건너뜁니다.
                        if (dto.getCategory() == null || dto.getCategory().isBlank() ||
                                dto.getName() == null || dto.getName().isBlank()) {
                            return null;
                        }
                        IngredientsCategory category = categoryMap.get(dto.getCategory());
                        return Ingredients.builder()
                                .name(dto.getName())
                                .category(category)
                                .build();
                    })
                    .filter(Objects::nonNull) // null인 객체는 제외합니다.
                    .collect(Collectors.toList());

            // 5. 변환된 식재료 데이터를 DB에 한번에 저장합니다.
            ingredientsRepository.saveAll(ingredients);
            System.out.println(ingredients.size() + "개의 식재료 데이터가 JSON 파일로부터 성공적으로 저장되었습니다.");
        }
    }

    private Map<String, IngredientsCategory> saveCategoriesAndGetMap(List<IngredientDto> dtoList) {
        // DTO 리스트에서 중복되지 않는 카테고리 이름들을 추출합니다.
        Set<String> categoryNames = dtoList.stream()
                .map(IngredientDto::getCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // DB에 이미 존재하는 카테고리들을 조회합니다.
        List<IngredientsCategory> existingCategories = ingredientsCategoryRepository.findAll();
        Set<String> existingCategoryNames = existingCategories.stream()
                .map(IngredientsCategory::getName)
                .collect(Collectors.toSet());

        // DB에 없는 새로운 카테고리들만 저장 대상으로 추립니다.
        List<IngredientsCategory> newCategoriesToSave = categoryNames.stream()
                .filter(name -> !existingCategoryNames.contains(name))
                .map(name -> IngredientsCategory.builder().name(name).build())
                .collect(Collectors.toList());

        if (!newCategoriesToSave.isEmpty()) {
            ingredientsCategoryRepository.saveAll(newCategoriesToSave);
        }

        // 전체 카테고리 정보를 DB에서 다시 불러와 Map으로 만들어 반환합니다.
        return ingredientsCategoryRepository.findAll().stream()
                .collect(Collectors.toMap(IngredientsCategory::getName, category -> category));
    }
}
