package com.example.ingredients_ms.domain.feedback.entity;

import com.example.ingredients_ms.domain.complaint.entity.Complaint;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@Table(name="complaint_feedback")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ComplaintFeedback extends BaseEntity {

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "content", length = 255, nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id") // 관리자인 경우 user_id
    private User responder;
}
