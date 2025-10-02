package com.example.ingredients_ms.domain.complaint.dto.response;

import com.example.ingredients_ms.domain.complaint.entity.Category;
import com.example.ingredients_ms.domain.complaint.entity.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter@Setter@Builder
public class ComplaintDetailResponseDto {

    private Long complaintId;
    private Category category;
    private String title;
    private String content;
    private ComplaintStatus status;
    private LocalDateTime createdAt;
    private String userName;

}
