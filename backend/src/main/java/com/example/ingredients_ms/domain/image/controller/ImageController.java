package com.example.ingredients_ms.domain.image.controller;

import com.example.ingredients_ms.domain.image.dto.ImageUploadResponseDto;
import com.example.ingredients_ms.domain.image.service.ImageService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/images")
@Tag(name = "이미지 관리 API", description = "이미지 업로드 및 삭제를 위한 API")
public class ImageController {

    private final ImageService imageService;

    @Operation(summary = "이미지 업로드", description = "이미지 파일을 S3에 업로드합니다.")
    @PostMapping("/upload")
    public RsData<ImageUploadResponseDto> uploadImage(@RequestParam("file") MultipartFile file) {
        return imageService.uploadImage(file);
    }

    @Operation(summary = "이미지 삭제", description = "S3에서 이미지를 삭제합니다.")
    @DeleteMapping("/{fileName}")
    public RsData<Void> deleteImage(@PathVariable String fileName) {
        return imageService.deleteImage(fileName);
    }
}