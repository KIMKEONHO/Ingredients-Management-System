package com.example.ingredients_ms.domain.user.dto.response;

import com.example.ingredients_ms.global.Status;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter@Setter@Builder
public class AllUserStatisticsResponseDto {

    private Long id;
    private String userName;
    private String userEmail;
    private String userPhoneNum;
    private LocalDateTime createdAt;
    private LocalDateTime recentLogin;
    private Status status;

}
