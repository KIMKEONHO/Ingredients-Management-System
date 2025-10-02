package com.example.ingredients_ms.global.alarm.repository;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.alarm.entity.Notification;
import com.example.ingredients_ms.global.alarm.entity.NotificationType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // 사용자의 모든 알람 조회 (최신순)
    List<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 사용자의 읽지 않은 알람 개수
    long countByUserAndIsReadFalse(User user);
    
    // 사용자의 특정 타입 알람 조회
    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, NotificationType type, Pageable pageable);
    
    // 사용자의 읽지 않은 알람 조회
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    // 특정 기간 이전의 알람 조회 (정리용)
    List<Notification> findByCreatedAtBefore(LocalDateTime dateTime);
    
    // 사용자별 알람 삭제
    void deleteByUser(User user);
    
    // 특정 기간 이전의 알람 삭제
    void deleteByCreatedAtBefore(LocalDateTime dateTime);
}
