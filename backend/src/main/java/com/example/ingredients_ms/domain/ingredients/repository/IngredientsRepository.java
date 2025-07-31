package com.example.ingredients_ms.domain.ingredients.repository;

import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientsRepository extends JpaRepository<Ingredients, Long> {


    List<Ingredients> findAllByOrderById();


    boolean existsByName(String name);


}