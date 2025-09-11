package com.example.ingredients_ms.domain.user.controller;

import com.example.ingredients_ms.domain.user.dto.response.AllUserStatisticsResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.UserStatisticsResponseDto;
import com.example.ingredients_ms.domain.user.service.UserStatisticsService;
import com.example.ingredients_ms.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/statistics")
@RequiredArgsConstructor
public class UserStatisticsController {

    private final UserStatisticsService userStatisticsService;

    @GetMapping("/")
    public RsData<?> getAllUsers(){

        List<AllUserStatisticsResponseDto> response = userStatisticsService.getAllUser();

        return new RsData<>("200", "모든 유저의 정보를 찾았습니다.", response);
    }

    @GetMapping("/{theme}")
    public RsData<UserStatisticsResponseDto> getUserStatistics(@PathVariable String theme) {
        UserStatisticsResponseDto response = userStatisticsService.getStatistics(theme);
        return new RsData<>("200", theme + " 단위의 유저 통계입니다.", response);
    }
}
