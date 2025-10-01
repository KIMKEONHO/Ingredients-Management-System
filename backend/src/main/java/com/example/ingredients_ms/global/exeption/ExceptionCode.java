package com.example.ingredients_ms.global.exeption;

import lombok.Getter;

public enum ExceptionCode {
    // 대충 중복은 409, 없는 리소스 요청이면 404, 인증 실패 401, 권한 없음 403
    USER_NOT_FOUND(404, "유저를 찾을 수 없습니다."),
    ID_NOT_FOUND(404, "ID를 찾을 수 없습니다."),
    NOT_ACTIVE(403, "활동이 가능한 ID가 아닙니다."),
    INCORRECT_PASSWORD(401, "올바르지 않은 패스워드입니다."),
    DUPLICATE_CATEGORY(409, "이미 존재하는 카테고리입니다."),
    CATEGORY_NOT_FOUND(404, "존재하지 않는 카테고리입니다."),
    INGREDIENT_NOT_FOUND(404, "존재하지 않는 식재료입니다."),
    DUPLICATE_INGREDIENT(409, "이미 존재하는 식재료입니다."),
    LIKE_NOT_FOUND(404, "존재하지 않는 식재료입니다."),
    LIKE_ALREADY_EXISTS(409,  "이미 '좋아요'를 누른 레시피입니다."),
    ALREADY_USER(409, "이미 존재하는 유저입니다."),
    INVALID_TOKEN(401, "유효하지 않은 토큰입니다."),
    CART_NOT_FOUND(404, "카트가 존재하지 않습니다."),
    NOT_OWNER(403, "해당 주인이 아닙니다."),
    COMPLAINT_NOT_FOUND(404,"컴플레인을 찾을 수 없습니다."),
    FOOD_INVENTORY_NOT_FOUND(404,"재고를 찾을 수 없습니다."),
    FEEDBACK_NOT_FOUND(404, "피드백을 찾을 수 없습니다."),
    NON_MATCHED(404,"인증코드가 올바르지 않습니다."),
    DIET_NOT_FOUND(404, "식단이 존재하지 않습니다."),
    NOT_ADMIN(403, "관리자 권한이 없습니다."),
    UNKNOW_THEME(404,"알 수 없는 시간단위 입니다."),

    RECIPE_NOT_FOUND(404,"레시피를 찾을 수 없습니다."),
    
    // 이미지 관련 예외
    IMAGE_UPLOAD_FAILED(500, "이미지 업로드에 실패했습니다."),
    IMAGE_DELETE_FAILED(500, "이미지 삭제에 실패했습니다."),
    INVALID_IMAGE_FILE(400, "유효하지 않은 이미지 파일입니다."),
    IMAGE_FILE_TOO_LARGE(400, "이미지 파일 크기가 너무 큽니다."),
    IMAGE_FILE_NOT_FOUND(404, "이미지 파일을 찾을 수 없습니다.")
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
