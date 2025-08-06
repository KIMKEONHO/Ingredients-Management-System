package com.example.ingredients_ms.domain.complaint.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class CreateComplaintRequestDto {

    private Long userId;
    private String title;
    private String content;
    private int categoryCode;

}
