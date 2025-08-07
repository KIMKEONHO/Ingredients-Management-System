package com.example.ingredients_ms.domain.feedback.dto.response;

import com.example.ingredients_ms.domain.feedback.entity.ComplaintFeedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintFeedbackResponseDto {

    private Long id;
    private String title;
    private String content;
    private Long complaintId;
    private String responderNickname;
    private LocalDateTime createAt;
    private LocalDateTime modifiedAt;

    public static ComplaintFeedbackResponseDto fromEntity(ComplaintFeedback feedback) {
        return ComplaintFeedbackResponseDto.builder()
                .id(feedback.getId())
                .title(feedback.getTitle())
                .content(feedback.getContent())
                .complaintId(feedback.getComplaint().getId())
                .responderNickname(feedback.getResponder().getNickname())
                .createAt(feedback.getCreatedAt())
                .modifiedAt(feedback.getModifiedAt())
                .build();
    }
}