package com.example.ingredients_ms.domain.ingredientscategory.controller;


import com.example.ingredients_ms.domain.ingredientscategory.dto.request.CreateIngredientsCategoryRequestDto;
import com.example.ingredients_ms.domain.ingredientscategory.dto.response.AllIngredientsCategoryResponseDto;
import com.example.ingredients_ms.domain.ingredientscategory.dto.response.IngredientsCategoryResponseDto;
import com.example.ingredients_ms.domain.ingredientscategory.dto.response.UpdateIngredientsCategoryResponseDto;
import com.example.ingredients_ms.domain.ingredientscategory.service.IngredientsCategoryService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@Tag(name = "[관리자] 식재료 카테고리 API", description = "식재료 카테고리 CRUD API")
@RestController
@RequestMapping("/api/v1/category")
public class IngredientsCategoryController {

    private final IngredientsCategoryService ingredientsCategoryService;


    @Operation(summary = "카테고리 조회", description = "카테고리를 조회한다.")
    @GetMapping("/")
    public RsData<List<AllIngredientsCategoryResponseDto>> getAllCategory(){

        List<AllIngredientsCategoryResponseDto> categoriesDto = ingredientsCategoryService.getAllCategory();
        return new RsData<>("200", "카테고리 목록이 성공적으로 조회되었습니다.",categoriesDto);

    }


    @Operation(summary = "카테고리 추가", description = "새로운 카테고리를 추가한다.")
    @PostMapping("/")
    public RsData<?> createCategory(@RequestBody CreateIngredientsCategoryRequestDto requestDto){

        IngredientsCategoryResponseDto responseDto = ingredientsCategoryService.createCategory(requestDto);
        return new RsData<>("200", "카테고리가 성공적으로 추가되었습니다.", requestDto);

    }

    @Operation(summary = "카테고리 수정", description = "카테고리를 수정한다.")
    @PutMapping("/{categoryId}")
    public RsData<?> updateCategory(@PathVariable(name = "categoryId")Long id,@RequestBody CreateIngredientsCategoryRequestDto requestDto){

        UpdateIngredientsCategoryResponseDto responseDto = ingredientsCategoryService.updateCategory(id, requestDto);
        return new RsData<>("200", "카테고리가 성공적으로 수정되었습니다.");

    }

    @Operation(summary = "카테고리 삭제", description = "카테고리를 삭제한다.")
    @DeleteMapping("/{categoryId}")
    public RsData<?> deleteCategory(@PathVariable(name = "categoryId")Long id){

        ingredientsCategoryService.deleteCategory(id);
        return new RsData<>("200", "카테고리가 성공적으로 삭제되었습니다.");
    }


}
