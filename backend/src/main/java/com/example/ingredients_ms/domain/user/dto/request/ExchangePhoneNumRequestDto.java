package com.example.ingredients_ms.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ExchangePhoneNumRequestDto {

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하로 입력해주세요.")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[!@#$%^&+=]).{8,20}$",
            message = "비밀번호는 8-20자이며, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.")
    public String phoneNum;
}
