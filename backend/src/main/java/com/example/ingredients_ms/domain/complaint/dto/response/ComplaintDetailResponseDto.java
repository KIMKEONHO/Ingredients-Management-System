package com.example.ingredients_ms.domain.complaint.dto.response;

import com.example.ingredients_ms.domain.complaint.entity.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter@Builder
public class ComplaintDetailResponseDto {

    private Long complaintId;
    private String title;
    private String content;
    private ComplaintStatus status;

}
