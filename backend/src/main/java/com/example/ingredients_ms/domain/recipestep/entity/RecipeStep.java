package com.example.ingredients_ms.domain.recipestep.entity;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "recipe_step")
@SuperBuilder
public class RecipeStep extends BaseEntity {
    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "cooking_time")
    private Integer cookingTime; // 해당 단계 소요 시간

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;
}