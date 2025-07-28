package com.example.ingredients_ms.domain.user.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter@Builder
public class LoginResponseDto {

    private String email;
    private String password;

}
