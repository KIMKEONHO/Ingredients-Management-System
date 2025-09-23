package com.example.ingredients_ms.domain.recipeingredient.repository;

import com.example.ingredients_ms.domain.recipeingredient.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
}
