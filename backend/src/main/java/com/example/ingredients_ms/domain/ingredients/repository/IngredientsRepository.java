package com.example.ingredients_ms.domain.ingredients.repository;

import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientsRepository extends JpaRepository<Ingredients, Long> {


    List<Ingredients> findAllByOrderById();

    List<Ingredients> findByCategoryOrderById(IngredientsCategory category);

    boolean existsByName(String name);


}