package com.example.ingredients_ms.domain.user.dto.request;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class ChangeUserDataRequestDto {

    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userStatus;
}
