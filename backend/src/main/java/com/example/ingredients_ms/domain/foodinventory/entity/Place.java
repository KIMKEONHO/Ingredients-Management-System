package com.example.ingredients_ms.domain.foodinventory.entity;

import java.util.Arrays;

public enum Place {
    REFRIGERATED("refrigerated"),
    FROZEN("frozen"),
    ROOM("room");

    private final String value;

    Place(String value) {
        this.value = value; // Enum 값과 문자열 값을 연결
    }

    public String getValue() {
        return value; // 문자열 값을 반환
    }

    public static Place fromValue(String value) {
        return Arrays.stream(Place.values())
                .filter(place -> place.getValue().equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid palce value: " + value));
    }
}
