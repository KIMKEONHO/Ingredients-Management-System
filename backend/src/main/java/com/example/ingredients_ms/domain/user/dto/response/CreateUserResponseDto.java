package com.example.ingredients_ms.domain.user.dto.response;

import lombok.*;

@Getter @Setter @Builder
public class CreateUserResponseDto {

    private String Name;
    private String Email;

}
