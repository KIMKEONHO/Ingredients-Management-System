package com.example.ingredients_ms.domain.consumedlog.controller;

import com.example.ingredients_ms.domain.consumedlog.Service.ConsumedLogService;
import com.example.ingredients_ms.domain.consumedlog.dto.response.ConsumedLogResponseDto;
import com.example.ingredients_ms.domain.consumedlog.dto.response.MonthlyConsumedLogResponseDto;
import com.example.ingredients_ms.global.jwt.TokenService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/consumedlog")
@Tag(name = "식품 재고 사용량 API", description = "식품 재고 사용량 관리를 위한 API")
@RequiredArgsConstructor
public class ConsumedLogController {


    private final TokenService tokenService;
    private final ConsumedLogService consumedLogService;

    // 식품 재고 수량만 수정하는 엔드포인트 추가
    @Operation(summary = "이번 달 식품 재고 사용량 조회", description = "이번 달 식품 재고의 사용량을 조회합니다.")
    @GetMapping("/thismonth")
    public RsData<List<ConsumedLogResponseDto>> getThisMonthConsumedLogStat() {

        Long userId = tokenService.getIdFromToken();

        List<ConsumedLogResponseDto> responseDtos = consumedLogService.getThisMonthConsumedLogStat(userId);


        return new RsData<>("200", "이번 달 식품 재고 사용량이 성공적으로 조회되었습니다.",responseDtos);
    }



    @Operation(summary = "지난 3개월 식품 재고 사용량 조회", description = "지난 3개월간 식품 재고 사용량을 모두 조회합니다.")
    @GetMapping("/last3months")
    public RsData<List<ConsumedLogResponseDto>> getLast3MonthConsumedLogStat(){
        Long userId = tokenService.getIdFromToken();

        List<ConsumedLogResponseDto> responseDtos = consumedLogService.get3MonthConsumedLogStat(userId);

        return new RsData<>("200","지난 3개얼간 식품 재고 상용량을 성공적으로 조회하였습니다.",responseDtos);
    }

    @Operation(summary = "올해 식품 재고 사용량 조회", description = "올해 식품 재고 사용량을 모두 조회합니다.")
    @GetMapping("/thisyear")
    public RsData<List<ConsumedLogResponseDto>> getThisYearConsumedLogStat(){
        Long userId = tokenService.getIdFromToken();

        List<ConsumedLogResponseDto> responseDtos = consumedLogService.getThisYearConsumedLogStat(userId);

        return new RsData<>("200","올해 식품 재고 상용량을 성공적으로 조회하였습니다.",responseDtos);
    }

    @Operation(summary = "이번 주 식품 재고 사용량 조회", description = "이번 주 식품 재고 사용량을 모두 조회합니다.")
    @GetMapping("/thisweek")
    public RsData<List<ConsumedLogResponseDto>> getThisWeekConsumedLogStat(){
        Long userId = tokenService.getIdFromToken();

        List<ConsumedLogResponseDto> responseDtos = consumedLogService.getThisWeekConsumedLogStat(userId);

        return new RsData<>("200","이번 주 식품 재고 상용량을 성공적으로 조회하였습니다.",responseDtos);
    }


    @Operation(summary = "올해 월별 식품 재고 사용량 조회", description = "올해 월별 식품 재고 사용량을 모두 조회합니다.")
    @GetMapping("/monthly")
    public RsData<List<MonthlyConsumedLogResponseDto>> getMonthlyConsumedLogStat(){

        Long userId = tokenService.getIdFromToken();
        List<MonthlyConsumedLogResponseDto> responseDtos= consumedLogService.getMonthlyConsumedLogByCategory(userId);

        return new RsData<>("200","월별 식품 재고 사용량을 성공적으로 조회하였습니다.",responseDtos);
    }

    @Operation(summary = "전체 식품 재고 사용량 조회", description = "식품 재고 사용량을 모두 조회합니다.")
    @GetMapping("/all")
    public RsData<List<ConsumedLogResponseDto>> getALlLogs(){
        Long userId = tokenService.getIdFromToken();
        List<ConsumedLogResponseDto> responseDtos = consumedLogService.getAllLogs(userId);
        return new RsData<>("200","모든 식품 재고 사용량을 성공적으로 조회하였습니다.",responseDtos);
    }






}
