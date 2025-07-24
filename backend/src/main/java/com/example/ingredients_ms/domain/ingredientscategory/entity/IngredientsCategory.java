package com.example.ingredients_ms.domain.ingredientscategory.entity;


import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name="Ingredient_Categories")
@NoArgsConstructor
@AllArgsConstructor
public class IngredientsCategory extends BaseEntity {

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Ingredients> ingredients = new ArrayList<>();

}
