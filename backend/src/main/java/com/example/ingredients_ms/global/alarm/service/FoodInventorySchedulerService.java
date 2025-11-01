package com.example.ingredients_ms.global.alarm.service;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus;
import com.example.ingredients_ms.domain.foodinventory.repository.FoodInventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoodInventorySchedulerService {

    private final FoodInventoryRepository foodInventoryRepository;
    private final NotificationService notificationService;
    private final SseService sseService;

    /**
     * 매시간마다 식재료 상태 업데이트 및 알람 발송 (실시간성 향상)
     */
    @Scheduled(cron = "0 0 * * * ?") // 매시간마다
    @Transactional
    public void updateFoodInventoryStatus() {
        log.info("식재료 상태 업데이트 스케줄러 시작");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);
        
        try {
            // 1. 만료 임박 식재료 처리 (3일 이내)
            updateExpiringSoonIngredients(now, threeDaysLater);
            
            // 2. 만료된 식재료 처리
            updateExpiredIngredients(now);
            
            log.info("식재료 상태 업데이트 스케줄러 완료");
        } catch (Exception e) {
            log.error("식재료 상태 업데이트 중 오류 발생", e);
        }
    }

    /**
     * 만료 임박 식재료 상태 업데이트 및 알람 발송
     */
    private void updateExpiringSoonIngredients(LocalDateTime now, LocalDateTime threeDaysLater) {
        List<FoodInventory> expiringSoonIngredients = foodInventoryRepository
                .findExpiringSoonIngredients(now, threeDaysLater);
        
        if (!expiringSoonIngredients.isEmpty()) {
            // 상태 업데이트
            List<Long> ids = expiringSoonIngredients.stream()
                    .map(FoodInventory::getId)
                    .toList();
            foodInventoryRepository.updateStatusByIds(ids, FoodStatus.EXPIRING_SOON);
            
            // 알람 발송
            for (FoodInventory inventory : expiringSoonIngredients) {
                try {
                    notificationService.createExpiringSoonNotification(
                            inventory.getUser().getId(),
                            inventory.getIngredient().getName(),
                            inventory.getExpirationDate()
                    );
                } catch (Exception e) {
                    log.error("만료 임박 알람 발송 실패 - 사용자 ID: {}, 식재료: {}", 
                            inventory.getUser().getId(), inventory.getIngredient().getName(), e);
                }
            }
            
            log.info("{}개의 식재료를 만료 임박 상태로 업데이트하고 알람을 발송했습니다.", expiringSoonIngredients.size());
        }
    }

    /**
     * 만료된 식재료 상태 업데이트 및 알람 발송
     */
    private void updateExpiredIngredients(LocalDateTime now) {
        // 내일 자정을 기준으로 오늘 날짜까지 만료된 것으로 처리
        LocalDate tomorrow = now.toLocalDate().plusDays(1);
        LocalDateTime startOfTomorrow = tomorrow.atStartOfDay();
        List<FoodInventory> expiredIngredients = foodInventoryRepository.findExpiredIngredients(startOfTomorrow);
        
        if (!expiredIngredients.isEmpty()) {
            // 상태 업데이트
            List<Long> ids = expiredIngredients.stream()
                    .map(FoodInventory::getId)
                    .toList();
            foodInventoryRepository.updateStatusByIds(ids, FoodStatus.EXPIRED);
            
            // 알람 발송
            for (FoodInventory inventory : expiredIngredients) {
                try {
                    notificationService.createExpiredNotification(
                            inventory.getUser().getId(),
                            inventory.getIngredient().getName(),
                            inventory.getExpirationDate()
                    );
                } catch (Exception e) {
                    log.error("만료 알람 발송 실패 - 사용자 ID: {}, 식재료: {}", 
                            inventory.getUser().getId(), inventory.getIngredient().getName(), e);
                }
            }
            
            log.info("{}개의 식재료를 만료 상태로 업데이트하고 알람을 발송했습니다.", expiredIngredients.size());
        }
    }

    /**
     * 오래된 알람 정리 스케줄러 (매주 일요일 자정)
     */
    @Scheduled(cron = "0 0 0 * * SUN")
    @Transactional
    public void cleanupOldNotifications() {
        log.info("오래된 알람 정리 스케줄러 시작");
        try {
            notificationService.cleanupOldNotifications();
            log.info("오래된 알람 정리 완료");
        } catch (Exception e) {
            log.error("오래된 알람 정리 중 오류 발생", e);
        }
    }

    /**
     * SSE 연결 상태 체크 스케줄러 (매 5분마다)
     */
    @Scheduled(fixedRate = 5 * 60 * 1000) // 5분마다
    public void checkSseConnections() {
        log.debug("SSE 연결 상태 체크 - 현재 연결 수: {}", sseService.getConnectionCount());
    }
}
