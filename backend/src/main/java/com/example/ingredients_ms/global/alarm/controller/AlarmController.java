package com.example.ingredients_ms.global.alarm.controller;

import com.example.ingredients_ms.global.alarm.dto.AlarmRequest;
import com.example.ingredients_ms.global.alarm.service.SseEmitters;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/alarm")
@RequiredArgsConstructor
public class AlarmController {

    private final SseEmitters sseEmitters;

    @PostMapping("/send")
    public void sendAlarm(@RequestBody AlarmRequest request) {
        sseEmitters.noti("alarm", Map.of(
                "type", request.getType(),
                "message", request.getMessage(),
                "data", request.getData()
        ));
    }

}
