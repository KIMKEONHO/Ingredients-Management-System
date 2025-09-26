package com.example.ingredients_ms.domain.image.service;

import com.example.ingredients_ms.domain.image.dto.ImageUploadResponseDto;
import com.example.ingredients_ms.domain.image.exception.ImageException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import com.example.ingredients_ms.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    
    private final S3Client s3Client;
    
    @Value("${custom.aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${custom.aws.s3.region}")
    private String region;
    
    @Value("${custom.aws.s3.img-dir-name}")
    private String imgDirName;
    
    /**
     * 이미지를 S3에 업로드합니다. (폴더 타입별)
     * @param file 업로드할 이미지 파일
     * @param folderType 이미지 폴더 타입
     * @return 업로드된 이미지 정보
     */
    public RsData<ImageUploadResponseDto> uploadImage(MultipartFile file, ImageFolderType folderType) {
        try {
            // 파일 유효성 검증
            validateImageFile(file);
            
            // 고유한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFileName = UUID.randomUUID().toString() + "." + extension;
            
            // 폴더별 경로 생성
            String s3Key = imgDirName + "/" + folderType.getFolderPath() + "/" + uniqueFileName;
            
            // S3에 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();
            
            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            // 업로드된 이미지 URL 생성
            String imageUrl = getS3FileUrl(s3Key);
            
            // 응답 DTO 생성
            ImageUploadResponseDto responseDto = new ImageUploadResponseDto(
                    imageUrl,
                    originalFilename,
                    uniqueFileName,
                    file.getSize(),
                    file.getContentType()
            );
            
            return new RsData<>("201", "이미지가 성공적으로 업로드되었습니다.", responseDto);
            
        } catch (IOException e) {
            throw new ImageException(ExceptionCode.IMAGE_UPLOAD_FAILED, "이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 기존 uploadImage 메서드 (하위 호환성을 위해 유지)
     */
    public RsData<ImageUploadResponseDto> uploadImage(MultipartFile file) {
        return uploadImage(file, ImageFolderType.GENERAL);
    }
    
    /**
     * S3에서 이미지를 삭제합니다.
     * @param fileName 삭제할 파일명
     * @return 삭제 결과
     */
    public RsData<Void> deleteImage(String fileName) {
        try {
            String s3Key = imgDirName + "/" + fileName;
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();
            
            s3Client.deleteObject(deleteObjectRequest);
            
            return new RsData<>("204", "이미지가 성공적으로 삭제되었습니다.", null);
            
        } catch (Exception e) {
            throw new ImageException(ExceptionCode.IMAGE_DELETE_FAILED, "이미지 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * S3 파일 URL을 생성합니다.
     * @param s3Key S3 객체 키
     * @return 완전한 S3 URL
     */
    public String getS3FileUrl(String s3Key) {
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + s3Key;
    }
    
    /**
     * 이미지 파일 유효성을 검증합니다.
     * @param file 검증할 파일
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ImageException(ExceptionCode.INVALID_IMAGE_FILE, "업로드할 파일이 없습니다.");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ImageException(ExceptionCode.INVALID_IMAGE_FILE, "이미지 파일만 업로드 가능합니다.");
        }
        
        // 파일 크기 제한 (10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new ImageException(ExceptionCode.IMAGE_FILE_TOO_LARGE, "파일 크기는 10MB를 초과할 수 없습니다.");
        }
    }
    
    /**
     * 파일 확장자를 추출합니다.
     * @param filename 파일명
     * @return 확장자
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            throw new ImageException(ExceptionCode.INVALID_IMAGE_FILE, "파일명이 올바르지 않습니다.");
        }
        
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            throw new ImageException(ExceptionCode.INVALID_IMAGE_FILE, "파일 확장자가 없습니다.");
        }
        
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
}
