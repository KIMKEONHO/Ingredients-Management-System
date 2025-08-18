package com.example.ingredients_ms.domain.foodinventory.entity;

import java.util.Arrays;

public enum FoodStatus {
    NORMAL("normal"),
    EXPIRING_SOON("expiring_soon"),
    EXPIRED("expired"),;

    private final String value;

    FoodStatus(String value) {
        this.value = value; // Enum 값과 문자열 값을 연결
    }

    public String getValue() {
        return value; // 문자열 값을 반환
    }

    public static FoodStatus fromValue(String value) {
        return Arrays.stream(FoodStatus.values())
                .filter(status -> status.getValue().equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid FoodStatus value: " + value));
    }
}
