package com.example.ingredients_ms.domain.diet.entity;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "diet")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Diet extends BaseEntity {

    @Column(name = "menu", nullable = false)
    private String menu;

    @Column(name = "kcal", nullable = false)
    private Integer kcal;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

}
