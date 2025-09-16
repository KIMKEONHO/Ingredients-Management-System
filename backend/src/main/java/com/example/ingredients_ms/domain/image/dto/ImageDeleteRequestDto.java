package com.example.ingredients_ms.domain.image.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "이미지 삭제 요청 DTO")
public class ImageDeleteRequestDto {
    
    @NotBlank(message = "파일명은 필수입니다.")
    @Schema(description = "삭제할 파일명", example = "uuid-filename.jpg")
    private String fileName;
}
