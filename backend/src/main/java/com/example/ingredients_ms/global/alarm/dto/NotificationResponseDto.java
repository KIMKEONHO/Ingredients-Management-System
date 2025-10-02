package com.example.ingredients_ms.global.alarm.dto;

import com.example.ingredients_ms.global.alarm.entity.Notification;
import com.example.ingredients_ms.global.alarm.entity.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponseDto {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String data;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public static NotificationResponseDto fromEntity(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .data(notification.getData())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
