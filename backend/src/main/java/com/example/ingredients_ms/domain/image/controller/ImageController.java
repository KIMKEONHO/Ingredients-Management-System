package com.example.ingredients_ms.domain.image.controller;

import com.example.ingredients_ms.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Bucket;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController{

    private final S3Client s3Client;

    private static final String BUCKET_NAME = "dev-bucket-lolgun0629-1";
    private static final String REGION = "ap-northeast-2";
    private static final String IMG_DIR_NAME = "img1";

    public static String getS3FileUrl(String fileName) {
        return "https://" + BUCKET_NAME + ".s3." + REGION + ".amazonaws.com/" + fileName;
    }

    @GetMapping("/")
    public List<String> home() {
        List<Bucket> bucketList = s3Client.listBuckets().buckets();
        return bucketList.stream().map(Bucket::name).collect(Collectors.toList());
    }

    // 이미지 업로드
    @PostMapping("/upload")
    @ResponseBody
    public RsData<?> handleFileUpload(MultipartFile file) throws IOException {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(IMG_DIR_NAME + "/" + file.getOriginalFilename())
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        return new RsData<>("201","이미지가 추가되었습니다.");
    }

    // 이미지 삭제
    @PostMapping("/deleteFile")
    @ResponseBody
    public RsData<?> deleteFile(String fileName) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(IMG_DIR_NAME + "/" + fileName)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
        return new RsData<>("204","이미지가 삭제되었습니다.");
    }

}
