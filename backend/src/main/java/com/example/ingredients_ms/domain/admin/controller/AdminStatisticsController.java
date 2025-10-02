package com.example.ingredients_ms.domain.admin.controller;

import com.example.ingredients_ms.domain.admin.dto.response.AdminStatisticsResponseDto;
import com.example.ingredients_ms.domain.admin.dto.response.ChartDataResponseDto;
import com.example.ingredients_ms.domain.admin.service.AdminStatisticsService;
import com.example.ingredients_ms.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    @GetMapping("/statistics/{theme}")
    public RsData<AdminStatisticsResponseDto> getAdminStatistics(@PathVariable String theme) {
        AdminStatisticsResponseDto response = adminStatisticsService.getAdminStatistics(theme);
        return new RsData<>("200", theme + " 단위의 관리자 통계입니다.", response);
    }

    @GetMapping("/charts/{theme}")
    public RsData<ChartDataResponseDto> getChartData(@PathVariable String theme) {
        ChartDataResponseDto response = adminStatisticsService.getChartData(theme);
        return new RsData<>("200", theme + " 단위의 차트 데이터입니다.", response);
    }
}

