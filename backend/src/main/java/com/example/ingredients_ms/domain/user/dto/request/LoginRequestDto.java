package com.example.ingredients_ms.domain.user.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
@Builder
public class LoginRequestDto {

    private String email;
    private String password;

}
