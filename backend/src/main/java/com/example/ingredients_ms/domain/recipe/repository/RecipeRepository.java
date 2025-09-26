package com.example.ingredients_ms.domain.recipe.repository;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe,Long> {
}
