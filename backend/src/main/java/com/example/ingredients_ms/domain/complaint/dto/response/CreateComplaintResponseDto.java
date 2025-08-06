package com.example.ingredients_ms.domain.complaint.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter@Builder
public class CreateComplaintResponseDto {

    private String title;
    private String content;

}
