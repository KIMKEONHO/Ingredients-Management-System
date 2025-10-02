package com.example.ingredients_ms.domain.complaint.entity;

import java.util.Arrays;

public enum Category {
    REQUEST(1, "request"),
    COMPLAINT(2, "complaint");

    private final int code;
    private final String value;

    Category(int code, String value) {
        this.code = code;
        this.value = value;
    }

    public int getCode() {
        return code;
    }

    public String getValue() {
        return value;
    }

    public static Category fromCode(int code) {
        return Arrays.stream(Category.values())
                .filter(category -> category.getCode() == code)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid category code: " + code));
    }
}
