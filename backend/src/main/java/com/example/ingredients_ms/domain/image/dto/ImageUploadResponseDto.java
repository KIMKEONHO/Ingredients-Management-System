package com.example.ingredients_ms.domain.image.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "이미지 업로드 응답 DTO")
public class ImageUploadResponseDto {
    
    @Schema(description = "업로드된 이미지 URL", example = "https://dev-bucket-lolgun0629-1.s3.ap-northeast-2.amazonaws.com/img1/uuid-filename.jpg")
    private String imageUrl;
    
    @Schema(description = "원본 파일명", example = "profile.jpg")
    private String originalFileName;
    
    @Schema(description = "S3에 저장된 파일명", example = "uuid-filename.jpg")
    private String storedFileName;
    
    @Schema(description = "파일 크기 (bytes)", example = "1024000")
    private Long fileSize;
    
    @Schema(description = "파일 타입", example = "image/jpeg")
    private String contentType;
}
