package com.example.ingredients_ms.domain.ingredientscategory.repository;

import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface IngredientsCategoryRepository extends JpaRepository<IngredientsCategory,Long> {

    List<IngredientsCategory> findAllByOrderById();


    Optional<IngredientsCategory> findByName(String name);


    boolean existsByName(String name);
}
