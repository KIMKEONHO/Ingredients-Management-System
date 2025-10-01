package com.example.ingredients_ms.domain.recipelike.entity;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "recipe_like",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "recipe_id"})
        })
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RecipeLike extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    // 좋아요 생성 시점 기록 (BaseEntity의 createdAt과 별도로)
    @Column(name = "liked_at", nullable = false)
    @Builder.Default
    private LocalDateTime likedAt = LocalDateTime.now();

    // 좋아요 취소 여부 (소프트 삭제용)
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // 좋아요 취소 메서드
    public void cancelLike() {
        this.isActive = false;
    }

    // 좋아요 재활성화 메서드
    public void reactivateLike() {
        this.isActive = true;
        this.likedAt = LocalDateTime.now();
    }
}