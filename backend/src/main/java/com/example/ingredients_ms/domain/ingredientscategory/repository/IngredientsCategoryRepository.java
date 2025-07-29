package com.example.ingredients_ms.domain.ingredientscategory.repository;

import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface IngredientsCategoryRepository extends JpaRepository<IngredientsCategory,Long> {

    List<IngredientsCategory> findAllByOrderByIdDesc();


    Optional<IngredientsCategory> findByName(String name);


}
