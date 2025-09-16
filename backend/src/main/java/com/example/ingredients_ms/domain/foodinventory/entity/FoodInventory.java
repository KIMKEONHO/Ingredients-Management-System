package com.example.ingredients_ms.domain.foodinventory.entity;

import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name="food_inventory")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FoodInventory extends BaseEntity {

    @Column(name = "quantity", length = 255, nullable = false)
    private Integer quantity;

    @Column(name = "original_quantity", nullable = false)
    private Integer originalQuantity; // 처음 구매한 개수

    @Column(name = "unit", length = 255, nullable = false)
    private String unit;

    @Column(name="bought_date", nullable = false)
    private LocalDateTime boughtDate;

    @Column(name="expiration_date", nullable = false)
    private LocalDateTime expirationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "place", nullable = false)
    private Place place; // Set<Place> -> Place

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private Ingredients ingredient;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private FoodStatus status = FoodStatus.NORMAL;

    @OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL)
    private List<ConsumedLog> logs = new ArrayList<>();

    public void updateStatus(FoodStatus status) {
        this.status = status;
    }
}
