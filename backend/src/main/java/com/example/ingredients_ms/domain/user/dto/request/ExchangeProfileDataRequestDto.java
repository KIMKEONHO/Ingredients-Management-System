package com.example.ingredients_ms.domain.user.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter@Setter
public class ExchangeProfileDataRequestDto {

    private String nickname;
    private String phoneNum;

}
