package com.example.ingredients_ms.domain.ingredients.entity;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.ingredientscategory.entity.IngredientsCategory;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name="ingredients")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Ingredients extends BaseEntity {

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private IngredientsCategory category;

    @OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL)
    private List<FoodInventory> inventories = new ArrayList<>();
}
