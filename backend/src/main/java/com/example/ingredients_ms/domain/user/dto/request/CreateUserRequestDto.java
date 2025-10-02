package com.example.ingredients_ms.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter@Builder
public class CreateUserRequestDto {

    @Email(message = "유효한 이메일 주소를 입력해주세요.")
    @NotBlank(message = "이메일은 필수 입력 값입니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하로 입력해주세요.")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[!@#$%^&+=]).{8,20}$",
            message = "비밀번호는 8-20자이며, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.")
    private String password;

    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하로 입력해주세요.")
    @Pattern(regexp = "^[가-힣a-zA-Z0-9]*$",
            message = "닉네임은 한글, 영문, 숫자만 포함할 수 있습니다.")
    private String nickName;

    @NotBlank(message = "이름은 필수 입력 값입니다.")
    @Pattern(regexp = "^[가-힣a-zA-Z]*$", message = "이름은 한글과 영문만 입력 가능합니다.")
    private String name;


    @NotBlank(message = "전화번호는 필수 입력 값입니다.")
    @Pattern(regexp = "^01(?:0|1|[6-9])-(?:\\d{3}|\\d{4})-\\d{4}$",
            message = "유효한 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)")
    private String phoneNumber;

}
