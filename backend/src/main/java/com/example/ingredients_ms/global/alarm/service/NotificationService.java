package com.example.ingredients_ms.global.alarm.service;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.alarm.dto.NotificationResponseDto;
import com.example.ingredients_ms.global.alarm.entity.Notification;
import com.example.ingredients_ms.global.alarm.entity.NotificationType;
import com.example.ingredients_ms.global.alarm.repository.NotificationRepository;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    @Value("${custom.admin.main-email}")
    private String adminEmail;

    /**
     * 알람 생성
     */
    @Transactional
    public Notification createNotification(Long userId, NotificationType type, String title, String message, String data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .data(data)
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        
        // SSE로 실시간 알람 발송
        NotificationResponseDto responseDto = NotificationResponseDto.fromEntity(savedNotification);
        sseService.sendNotification(userId, responseDto);
        
        return savedNotification;
    }

    /**
     * 좋아요 알람 생성
     */
    @Transactional
    public Notification createLikeNotification(Long recipeOwnerId, String recipeTitle, Long likerId) {
        User liker = userRepository.findById(likerId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        String title = "새로운 좋아요";
        String message = String.format("%s님이 '%s' 레시피에 좋아요를 눌렀습니다.", liker.getNickname(), recipeTitle);
        String data = String.format("{\"recipeTitle\":\"%s\",\"likerId\":%d,\"likerNickname\":\"%s\"}", 
                recipeTitle, likerId, liker.getNickname());

        return createNotification(recipeOwnerId, NotificationType.LIKE, title, message, data);
    }

    /**
     * 민원 알람 생성 (관리자에게)
     */
    @Transactional
    public Notification createComplaintNotification(Long complaintId, String complaintTitle, String complainantNickname) {

        User admin = userRepository.findByEmail(adminEmail).orElseThrow(() -> new BusinessLogicException(ExceptionCode.ADMIN_NOT_FOUND));
        
        String title = "새로운 민원 접수";
        String message = String.format("%s님이 민원을 작성했습니다: %s", complainantNickname, complaintTitle);
        String data = String.format("{\"complaintId\":%d,\"complaintTitle\":\"%s\",\"complainantNickname\":\"%s\"}", 
                complaintId, complaintTitle, complainantNickname);

        return createNotification(admin.getId(), NotificationType.COMPLAINT, title, message, data);
    }

    /**
     * 식재료 만료 임박 알람 생성
     */
    @Transactional
    public Notification createExpiringSoonNotification(Long userId, String ingredientName, LocalDateTime expirationDate) {
        String title = "식재료 만료 임박";
        String message = String.format("'%s'이(가) %s에 만료됩니다.", ingredientName, expirationDate.toLocalDate());
        String data = String.format("{\"ingredientName\":\"%s\",\"expirationDate\":\"%s\"}", 
                ingredientName, expirationDate.toString());

        return createNotification(userId, NotificationType.EXPIRING_SOON, title, message, data);
    }

    /**
     * 식재료 만료 알람 생성
     */
    @Transactional
    public Notification createExpiredNotification(Long userId, String ingredientName, LocalDateTime expirationDate) {
        String title = "식재료 만료";
        String message = String.format("'%s'이(가) %s에 만료되었습니다.", ingredientName, expirationDate.toLocalDate());
        String data = String.format("{\"ingredientName\":\"%s\",\"expirationDate\":\"%s\"}", 
                ingredientName, expirationDate.toString());

        return createNotification(userId, NotificationType.EXPIRED, title, message, data);
    }

    /**
     * 사용자의 알람 목록 조회
     */
    public List<Notification> getUserNotifications(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * 사용자의 읽지 않은 알람 개수 조회
     */
    public long getUnreadNotificationCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * 알람 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    /**
     * 모든 알람 읽음 처리
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        unreadNotifications.forEach(Notification::markAsRead);
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * 알람 삭제
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        notificationRepository.delete(notification);
    }

    /**
     * 오래된 알람 정리 (30일 이전)
     */
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Notification> oldNotifications = notificationRepository.findByCreatedAtBefore(thirtyDaysAgo);
        
        if (!oldNotifications.isEmpty()) {
            notificationRepository.deleteAll(oldNotifications);
            log.info("{}개의 오래된 알람을 삭제했습니다.", oldNotifications.size());
        }
    }
}
