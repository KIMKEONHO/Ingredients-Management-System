package com.example.ingredients_ms.domain.diet.entity;

import java.util.Arrays;

public enum MealType {
    BREAKFAST("breakfast"),
    LUNCH("lunch"),
    DINNER("dinner"); //

    private final String value;

    MealType(String value) {
        this.value = value; // Enum 값과 문자열 값을 연결
    }

    public String getValue() {
        return value; // 문자열 값을 반환
    }

    public static MealType fromValue(String value) {
        return Arrays.stream(MealType.values())
                .filter(mealType -> mealType.getValue().equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid mealType value: " + value));
    }
}