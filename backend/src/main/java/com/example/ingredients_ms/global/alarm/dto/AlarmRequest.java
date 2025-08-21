package com.example.ingredients_ms.global.alarm.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Data
public class AlarmRequest {
    private String type;
    private String message;
    private String data;
}