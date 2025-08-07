package com.example.ingredients_ms.domain.feedback.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplaintFeedbackRequestDto {

    private String title;
    private String content;

}
