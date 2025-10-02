package com.example.ingredients_ms.global.alarm.controller;

import com.example.ingredients_ms.global.alarm.dto.NotificationResponseDto;
import com.example.ingredients_ms.global.alarm.entity.Notification;
import com.example.ingredients_ms.global.alarm.service.NotificationService;
import com.example.ingredients_ms.global.alarm.service.SseService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final SseService sseService;

    /**
     * SSE 연결 생성 (실시간 알람 수신)
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@CurrentUser SecurityUser currentUser) {
        log.info("SSE 연결 요청 - 사용자 ID: {}", currentUser.getId());
        return sseService.createConnection(currentUser.getId());
    }

    /**
     * 사용자의 알람 목록 조회
     */
    @GetMapping
    public RsData<List<NotificationResponseDto>> getUserNotifications(
            @CurrentUser SecurityUser currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<Notification> notifications = notificationService.getUserNotifications(
                currentUser.getId(), page, size);
        
        List<NotificationResponseDto> responseDtos = notifications.stream()
                .map(NotificationResponseDto::fromEntity)
                .collect(Collectors.toList());
        
        return new RsData<>("200", "알람 목록을 조회했습니다.", responseDtos);
    }

    /**
     * 사용자의 읽지 않은 알람 개수 조회
     */
    @GetMapping("/unread-count")
    public RsData<Long> getUnreadNotificationCount(@CurrentUser SecurityUser currentUser) {
        long count = notificationService.getUnreadNotificationCount(currentUser.getId());
        return new RsData<>("200", "읽지 않은 알람 개수를 조회했습니다.", count);
    }

    /**
     * 알람 읽음 처리
     */
    @PatchMapping("/{notificationId}/read")
    public RsData<Void> markAsRead(
            @PathVariable Long notificationId,
            @CurrentUser SecurityUser currentUser) {
        
        notificationService.markAsRead(notificationId, currentUser.getId());
        return new RsData<>("200", "알람을 읽음 처리했습니다.", null);
    }

    /**
     * 모든 알람 읽음 처리
     */
    @PatchMapping("/read-all")
    public RsData<Void> markAllAsRead(@CurrentUser SecurityUser currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return new RsData<>("200", "모든 알람을 읽음 처리했습니다.", null);
    }

    /**
     * 알람 삭제
     */
    @DeleteMapping("/{notificationId}")
    public RsData<Void> deleteNotification(
            @PathVariable Long notificationId,
            @CurrentUser SecurityUser currentUser) {
        
        notificationService.deleteNotification(notificationId, currentUser.getId());
        return new RsData<>("200", "알람을 삭제했습니다.", null);
    }

    /**
     * SSE 연결 상태 조회 (관리자용)
     */
    @GetMapping("/connections")
    public RsData<Integer> getConnectionCount() {
        int count = sseService.getConnectionCount();
        return new RsData<>("200", "현재 연결된 사용자 수를 조회했습니다.", count);
    }
}