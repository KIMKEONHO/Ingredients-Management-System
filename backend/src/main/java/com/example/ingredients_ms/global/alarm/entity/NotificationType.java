package com.example.ingredients_ms.global.alarm.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationType {

    LIKE("like"),
    COMPLAINT("complaint"),
    EXPIRING_SOON("expiring_soon"),
    EXPIRED("expired")
    ;

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static NotificationType fromValue(String value) {
        for (NotificationType notificationType : values()) {
            if (notificationType.value.equalsIgnoreCase(value)) {
                return notificationType;
            }
        }
        throw new IllegalArgumentException("Invalid status value: " + value);
    }
}
