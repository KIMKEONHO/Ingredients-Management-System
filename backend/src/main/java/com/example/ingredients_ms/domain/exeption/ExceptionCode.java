package com.example.ingredients_ms.domain.exeption;

import lombok.Getter;

public enum ExceptionCode {
    USER_NOT_FOUND(404,"유저를 찾을 수 없습니다."),
    ID_NOT_FOUND(404,"ID를 찾을 수 없습니다."),
    NOT_ACTIVE(404, "활동이 가능한 ID가 아닙니다."),
    INCORRECT_PASSWORD(404,"올바르지 않은 패스워드입니다."),
    DUPLICATE_CATEGORY(404,"이미 존재하는 카테고리입니다."),
    CATEGORY_NOT_FOUND(404,"존재하지 않는 카테고리입니다."),
    INGREDIENT_NOT_FOUND(404,"존재하지 않는 식재료입니다."),
    DUPLICATE_INGREDIENT(404,"이미 존재하는 식재료입니다."),
    ALREADY_USER(404, "이미 존재하는 유저입니다."),
    INVALID_TOKEN(404,"유효하지 않은 토큰입니다."),
    CART_NOT_FOUND(404,"카트가 존재하지 않습니다."),
    NOT_OWNER(404,"해당 주인이 아닙니다.")
    ;

    @Getter
    private int status;

    @Getter
    private String message;

    ExceptionCode(int code, String message) {
        this.status = code;
        this.message = message;
    }
}
