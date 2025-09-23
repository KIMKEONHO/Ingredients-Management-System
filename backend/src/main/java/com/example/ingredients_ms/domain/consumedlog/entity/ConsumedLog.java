package com.example.ingredients_ms.domain.consumedlog.entity;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name="consume_log")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ConsumedLog extends BaseEntity {

    @Column(name = "consumed_quantity", nullable = false)
    private Integer consumedQuantity; // 사용 개수

    @CreatedDate
    @Column(name="consumed_date", nullable = false)
    private LocalDateTime consumedDate;//묵은 날짜

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private FoodInventory inventory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;



}
