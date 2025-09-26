package com.example.ingredients_ms.domain.recipeingredient.entity;

import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "recipe_ingredient")
@SuperBuilder
@NoArgsConstructor
@Getter
public class RecipeIngredient extends BaseEntity {
    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "unit", nullable = false)
    private String unit;

    @Column(name = "notes")
    private String notes; // "선택사항", "대체 가능" 등

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private Ingredients ingredient;
}
