package com.example.ingredients_ms.domain.recipe.entity;

import com.example.ingredients_ms.domain.recipeingredient.entity.RecipeIngredient;
import com.example.ingredients_ms.domain.recipelike.entity.RecipeLike;
import com.example.ingredients_ms.domain.recipestep.entity.RecipeStep;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipe")
public class Recipe extends BaseEntity {
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cooking_time")
    private Integer cookingTime; // 분 단위

    @Column(name = "difficulty_level")
    private Integer difficultyLevel; // 1-5 단계

    @Column(name = "servings")
    private Integer servings; // 몇 인분

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipe_type")
    private RecipeType recipeType; // MAIN, SIDE, DESSERT, BEVERAGE 등

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true; // 공개 여부

    @Column(name = "view_count")
    private Long viewCount = 0L;

    @Column(name = "like_count")
    private Long likeCount = 0L;

    // 작성자와의 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    // 레시피 재료와의 관계
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL)
    private List<RecipeIngredient> recipeIngredients = new ArrayList<>();

    // 레시피 단계와의 관계
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL)
    private List<RecipeStep> recipeSteps = new ArrayList<>();

    // 좋아요와의 관계
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL)
    private List<RecipeLike> recipeLikes = new ArrayList<>();
}