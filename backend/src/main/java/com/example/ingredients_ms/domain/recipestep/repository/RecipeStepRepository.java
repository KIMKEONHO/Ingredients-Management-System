package com.example.ingredients_ms.domain.recipestep.repository;

import com.example.ingredients_ms.domain.recipestep.entity.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeStepRepository extends JpaRepository<RecipeStep,Long> {
}
