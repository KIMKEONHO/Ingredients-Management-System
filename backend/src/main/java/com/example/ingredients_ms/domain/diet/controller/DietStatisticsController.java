package com.example.ingredients_ms.domain.diet.controller;

import com.example.ingredients_ms.domain.diet.dto.response.DietStatisticsResponseDto;
import com.example.ingredients_ms.domain.diet.dto.response.WeekStatisticsResponseDto;
import com.example.ingredients_ms.domain.diet.service.DietStatisticsService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diet/statistics")
@RequiredArgsConstructor
public class DietStatisticsController {

    private final DietStatisticsService dietStatisticsService;

    // 월간 칼로리 통계 기능 + 지난달에 비해 증가/감소량
    @GetMapping("/month")
    public RsData<?> getMonthStatistics(
            @CurrentUser SecurityUser securityUser
    ){

        DietStatisticsResponseDto responseDto = dietStatisticsService.monthStatistics(securityUser.getId());

        return new RsData<>("200", "월간 통계를 조회하였습니다.", responseDto);
    }

    // 근 일주일간 섭취 칼로리 ( 그래프용 )
    @GetMapping("/week/graph")
    public RsData<?> getWeekGraphStatistics(
            @CurrentUser SecurityUser securityUser
    ){
        List<WeekStatisticsResponseDto> stats = dietStatisticsService.weekGraphStatistics(securityUser.getId());
        return new RsData<>("200", "최근 7일 통계 조회 성공", stats);
    }

    // 3개월 통계
    @GetMapping("/quarter")
    public RsData<?> getQuarterStatistics(@CurrentUser SecurityUser securityUser) {
        DietStatisticsResponseDto responseDto = dietStatisticsService.quarterStatistics(securityUser.getId());
        return new RsData<>("200", "3개월 통계를 조회하였습니다.", responseDto);
    }

    // 연간 통계
    @GetMapping("/year")
    public RsData<?> getYearStatistics(@CurrentUser SecurityUser securityUser) {
        DietStatisticsResponseDto responseDto = dietStatisticsService.yearStatistics(securityUser.getId());
        return new RsData<>("200", "연간 통계를 조회하였습니다.", responseDto);
    }

    // 연간 통계
    @GetMapping("/week")
    public RsData<?> getWeekStatistics(@CurrentUser SecurityUser securityUser) {
        DietStatisticsResponseDto responseDto = dietStatisticsService.weekStatistics(securityUser.getId());
        return new RsData<>("200", "연간 통계를 조회하였습니다.", responseDto);
    }

}
