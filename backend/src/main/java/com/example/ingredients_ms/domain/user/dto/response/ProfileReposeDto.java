package com.example.ingredients_ms.domain.user.dto.response;

import com.example.ingredients_ms.global.Status;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @Builder
public class ProfileReposeDto {

    private String nickName;
    private String email;
    private String profile;
    private String phoneNum;
    private Status userStatus;
    private LocalDateTime createdAt;

}
