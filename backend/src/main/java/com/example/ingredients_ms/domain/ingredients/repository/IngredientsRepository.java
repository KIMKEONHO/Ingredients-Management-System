package com.example.ingredients_ms.domain.ingredients.repository;

import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IngredientsRepository extends JpaRepository<Ingredients, Long> {


    List<Ingredients> findAllByOrderById();

    List<Ingredients> findByCategoryOrderById(IngredientsCategory category);

    boolean existsByName(String name);

    Ingredients findById(long id);

    Optional<Ingredients> findByName(String name);

    // 통계용 메서드
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}