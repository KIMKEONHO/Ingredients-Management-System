package com.example.ingredients_ms.domain.user.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class FindIdRequestDto {
    private String phone;
    private String name;
}
