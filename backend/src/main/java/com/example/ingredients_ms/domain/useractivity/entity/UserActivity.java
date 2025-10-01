package com.example.ingredients_ms.domain.useractivity.entity;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@Table(name = "user_activities")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserActivity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "description")
    private String description;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON 형태로 추가 정보 저장

    public enum ActivityType {
        LOGIN("로그인"),
        LOGOUT("로그아웃"),
        RECIPE_VIEW("레시피 조회"),
        RECIPE_CREATE("레시피 생성"),
        RECIPE_LIKE("레시피 좋아요"),
        RECIPE_UNLIKE("레시피 좋아요 취소"),
        INVENTORY_ADD("재고 추가"),
        INVENTORY_UPDATE("재고 수정"),
        INVENTORY_DELETE("재고 삭제"),
        DIET_LOG("식단 기록"),
        COMPLAINT_CREATE("민원 작성"),
        FEEDBACK_CREATE("피드백 작성"),
        PROFILE_UPDATE("프로필 수정"),
        PASSWORD_CHANGE("비밀번호 변경");

        private final String description;

        ActivityType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
