package com.example.ingredients_ms.domain.diet.controller;

import com.example.ingredients_ms.domain.diet.dto.request.CreateDietRequestDto;
import com.example.ingredients_ms.domain.diet.dto.request.DietRequestDto;
import com.example.ingredients_ms.domain.diet.dto.response.DietResponseDto;
import com.example.ingredients_ms.domain.diet.dto.response.MonthStatisticsResponseDto;
import com.example.ingredients_ms.domain.diet.dto.response.WeekStatisticsResponseDto;
import com.example.ingredients_ms.domain.diet.service.DietService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diet")
@RequiredArgsConstructor
public class DietController {

    private final DietService dietService;

    // 식단 추가
    @PostMapping("/add")
    public RsData<?> addDiet(
            @CurrentUser SecurityUser currentUser,
            @RequestBody CreateDietRequestDto requestDto
    ){

        dietService.addDiet(currentUser.getId(), requestDto);

        return new RsData<>("201", "식단이 추가되었습니다.");
    }

    // 월간 식단 조회
    @GetMapping("/{year}/{month}")
    public RsData<?> getDiet(
            @CurrentUser SecurityUser securityUser,
            @PathVariable("year") int year,
            @PathVariable("month") int month
    ){

        DietRequestDto  requestDto = DietRequestDto.builder()
                .year(year)
                .month(month)
                .build();

        List<DietResponseDto> diets = dietService.getAllDiets(securityUser.getId(),requestDto);

        return new RsData<>("200", requestDto.getMonth() + "월의 식단을 가져왔습니다.", diets);
    }

    //수정
    @PatchMapping("/{dietId}")
    public RsData<?> updateDiet(
            @CurrentUser SecurityUser securityUser,
            @RequestBody CreateDietRequestDto requestDto,
            @PathVariable Long dietId
    ){

        dietService.updateDiet(securityUser.getId(), requestDto, dietId);

        return new RsData<>("204", "식단이 업데이트 되었습니다.");
    }

    //삭제
    @DeleteMapping("/{dietId}")
    public RsData<?> deleteDiet(
            @CurrentUser SecurityUser securityUser,
            @PathVariable Long dietId
    ){

        dietService.deleteDiet(securityUser.getId(), dietId);

        return new RsData<>("204", "식단이 삭제되었습니다.");
    }

    // 월간 칼로리 통계 기능 + 지난달에 비해 증가/감소량
    @GetMapping("/month/statistics")
    public RsData<?> getMonthStatistics(
            @CurrentUser SecurityUser securityUser
    ){

        MonthStatisticsResponseDto responseDto = dietService.monthStatistics(securityUser.getId());

        return new RsData<>("200", "월간 통계를 조회하였습니다.", responseDto);
    }

    // 근 일주일간 섭취 칼로리 ( 그래프용 )
    @GetMapping("/week/statistics")
    public RsData<?> getWeekStatistics(
            @CurrentUser SecurityUser securityUser
    ){
        List<WeekStatisticsResponseDto> stats = dietService.weekStatistics(securityUser.getId());
        return new RsData<>("200", "최근 7일 통계 조회 성공", stats);
    }


}
