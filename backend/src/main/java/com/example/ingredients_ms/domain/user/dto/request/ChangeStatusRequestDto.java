package com.example.ingredients_ms.domain.user.dto.request;

import lombok.Getter;

@Getter
public class ChangeStatusRequestDto {

    private Long userId;
    private String status;

}
