package com.example.ingredients_ms.global.alarm.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SseService {

    // 사용자별 SSE 연결을 저장하는 Map
    private final Map<Long, SseEmitter> userConnections = new ConcurrentHashMap<>();

    /**
     * 사용자 SSE 연결 생성
     */
    public SseEmitter createConnection(Long userId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30분 타임아웃
        
        // 연결 완료 시 정리
        emitter.onCompletion(() -> {
            log.info("SSE 연결 완료 - 사용자 ID: {}", userId);
            userConnections.remove(userId);
        });
        
        // 타임아웃 시 정리
        emitter.onTimeout(() -> {
            log.info("SSE 연결 타임아웃 - 사용자 ID: {}", userId);
            userConnections.remove(userId);
        });
        
        // 에러 시 정리
        emitter.onError((ex) -> {
            log.error("SSE 연결 에러 - 사용자 ID: {}", userId, ex);
            userConnections.remove(userId);
        });
        
        userConnections.put(userId, emitter);
        log.info("SSE 연결 생성 - 사용자 ID: {}, 총 연결 수: {}", userId, userConnections.size());
        
        return emitter;
    }

    /**
     * 특정 사용자에게 알람 발송
     */
    public void sendNotification(Long userId, Object data) {
        SseEmitter emitter = userConnections.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(data));
                log.info("SSE 알람 발송 성공 - 사용자 ID: {}", userId);
            } catch (IOException e) {
                log.error("SSE 알람 발송 실패 - 사용자 ID: {}", userId, e);
                userConnections.remove(userId);
            }
        } else {
            log.debug("SSE 연결이 없어 알람 발송 불가 - 사용자 ID: {}", userId);
        }
    }

    /**
     * 모든 연결된 사용자에게 알람 발송 (관리자용)
     */
    public void broadcastNotification(Object data) {
        userConnections.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(data));
                log.info("SSE 브로드캐스트 알람 발송 성공 - 사용자 ID: {}", userId);
            } catch (IOException e) {
                log.error("SSE 브로드캐스트 알람 발송 실패 - 사용자 ID: {}", userId, e);
                userConnections.remove(userId);
            }
        });
    }

    /**
     * 연결된 사용자 수 조회
     */
    public int getConnectionCount() {
        return userConnections.size();
    }

    /**
     * 특정 사용자 연결 제거
     */
    public void removeConnection(Long userId) {
        SseEmitter emitter = userConnections.remove(userId);
        if (emitter != null) {
            emitter.complete();
            log.info("SSE 연결 제거 - 사용자 ID: {}", userId);
        }
    }

    /**
     * 모든 연결 정리
     */
    public void closeAllConnections() {
        userConnections.forEach((userId, emitter) -> {
            try {
                emitter.complete();
            } catch (Exception e) {
                log.error("SSE 연결 정리 실패 - 사용자 ID: {}", userId, e);
            }
        });
        userConnections.clear();
        log.info("모든 SSE 연결 정리 완료");
    }
}

