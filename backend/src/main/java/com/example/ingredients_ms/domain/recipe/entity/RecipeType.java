package com.example.ingredients_ms.domain.recipe.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RecipeType {

    // 활성, 비활성, 보류 중, 철회됨
    MAIN("main"),
    SIDE("side"),
    DESSERT("desert"),
    BEVERAGE("beverage");

    private final String value;

    RecipeType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RecipeType fromValue(String value) {
        for (RecipeType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid type value: " + value);
    }
}
