package com.example.ingredients_ms.domain.complaint.entity;

import com.example.ingredients_ms.domain.feedback.entity.ComplaintFeedback;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name="complaint")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Complaint extends BaseEntity {

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "content", length = 255)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "categories", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL)
    private List<ComplaintFeedback> feedbacks = new ArrayList<>();

    // Enum for status
    public enum ComplaintStatus {
        PENDING, IN_PROGRESS, COMPLETED, REJECTED
    }
}
