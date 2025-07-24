package com.example.ingredients_ms.domain.complaint.entity;

import java.util.Arrays;

public enum Category {
    REQUEST("request"),
    COMPLAINT("complaint");

    private final String value;

    Category(String value) {
        this.value = value; // Enum 값과 문자열 값을 연결
    }

    public String getValue() {
        return value; // 문자열 값을 반환
    }

    public static Category fromValue(String value) {
        return Arrays.stream(Category.values())
                .filter(category -> category.getValue().equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid category value: " + value));
    }
}
