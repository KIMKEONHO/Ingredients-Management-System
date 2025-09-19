package com.example.ingredients_ms.domain.consumedlog.Service;


import com.example.ingredients_ms.domain.consumedlog.dto.response.ConsumedLogResponseDto;
import com.example.ingredients_ms.domain.consumedlog.dto.response.MonthlyConsumedLogResponseDto;
import com.example.ingredients_ms.domain.consumedlog.repository.ConsumedLogRepository;
import com.example.ingredients_ms.domain.ingredientscategory.repository.IngredientsCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumedLogService {

    private final ConsumedLogRepository consumedLogRepository;
    private final IngredientsCategoryRepository ingredientsCategoryRepository;


    public List<ConsumedLogResponseDto> getThisMonthConsumedLogStat(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        YearMonth currentMonth = YearMonth.from(now);
        
        // 이번 달 시작일과 종료일
        LocalDateTime startDate = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // 카테고리별 사용량 조회
        List<Object[]> consumedData = consumedLogRepository.findConsumedQuantityByCategoryAndDateRange(
                userId, startDate, endDate);

        
        // 결과 DTO 리스트 생성
        List<ConsumedLogResponseDto> result = new ArrayList<>();
        
        for (Object[] data : consumedData) {
            Long categoryId = (Long) data[0];
            String categoryName = (String) data[1];
            Long totalConsumedQuantity = (Long) data[2];
            
            ConsumedLogResponseDto dto = ConsumedLogResponseDto.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalConsumedQuantity(totalConsumedQuantity.intValue())
                    .build();
            
            result.add(dto);
        }
        
        return result;
    }


    public List<MonthlyConsumedLogResponseDto> getMonthlyConsumedLogByCategory(Long userId) {
        int currentYear = LocalDateTime.now().getYear();
        
        // 이번년도 월별 카테고리별 사용량 조회
        List<Object[]> monthlyData = consumedLogRepository.findMonthlyConsumedQuantityByCategory(userId, currentYear);
        
        List<MonthlyConsumedLogResponseDto> result = new ArrayList<>();
        
        for (Object[] data : monthlyData) {
            Integer month = (Integer) data[0];
            Long categoryId = (Long) data[1];
            String categoryName = (String) data[2];
            Long totalConsumedQuantity = (Long) data[3];
            
            MonthlyConsumedLogResponseDto dto = MonthlyConsumedLogResponseDto.builder()
                    .month(month)
                    .monthName(month + "월")
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalConsumedQuantity(totalConsumedQuantity.intValue())
                    .build();
            
            result.add(dto);
        }
        
        return result;
    }


    public List<ConsumedLogResponseDto> get3MonthConsumedLogStat(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        YearMonth currentMonth = YearMonth.from(now);

        YearMonth prevMonth = currentMonth.minusMonths(1);
        YearMonth twoMonthsAgo = currentMonth.minusMonths(2);
        YearMonth threeMonthsAgo = currentMonth.minusMonths(3);

// 각 월의 시작일과 종료일 계산
        LocalDateTime prevMonthStart = prevMonth.atDay(1).atStartOfDay();
        LocalDateTime prevMonthEnd = prevMonth.atEndOfMonth().atTime(23, 59, 59);

        LocalDateTime twoMonthsAgoStart = twoMonthsAgo.atDay(1).atStartOfDay();
        LocalDateTime twoMonthsAgoEnd = twoMonthsAgo.atEndOfMonth().atTime(23, 59, 59);

        LocalDateTime threeMonthsAgoStart = threeMonthsAgo.atDay(1).atStartOfDay();
        LocalDateTime threeMonthsAgoEnd = threeMonthsAgo.atEndOfMonth().atTime(23, 59, 59);


        // 카테고리별 사용량 조회
        List<Object[]> consumedData = consumedLogRepository.findConsumedQuantityByCategoryAndDateRange(
                userId, threeMonthsAgoStart, prevMonthEnd);


        // 결과 DTO 리스트 생성
        List<ConsumedLogResponseDto> result = new ArrayList<>();

        for (Object[] data : consumedData) {
            Long categoryId = (Long) data[0];
            String categoryName = (String) data[1];
            Long totalConsumedQuantity = (Long) data[2];

            ConsumedLogResponseDto dto = ConsumedLogResponseDto.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalConsumedQuantity(totalConsumedQuantity.intValue())
                    .build();

            result.add(dto);
        }

        return result;
    }

    public List<ConsumedLogResponseDto> getThisYearConsumedLogStat(Long userId) {
        int currentYear = LocalDateTime.now().getYear();

        List<Object[]> consumedData = consumedLogRepository.findMonthlyConsumedQuantityByCategory(userId, currentYear);

        List<ConsumedLogResponseDto> result = new ArrayList<>();

        for (Object[] data : consumedData) {
            Long categoryId = (Long) data[1];
            String categoryName = (String) data[2];
            Long totalConsumedQuantity = (Long) data[3];

            ConsumedLogResponseDto dto = ConsumedLogResponseDto.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalConsumedQuantity(totalConsumedQuantity.intValue())
                    .build();

            result.add(dto);
        }

        return result;
    }

    public List<ConsumedLogResponseDto> getThisWeekConsumedLogStat(Long userId) {
        LocalDateTime now = LocalDateTime.now();

// 이번 주 시작일 (월요일) 구하기
        LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

// 이번 주 마지막 날 (일요일) 구하기
        LocalDateTime endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        List<Object[]> consumedData = consumedLogRepository.findConsumedQuantityByCategoryAndDateRange(userId, startOfWeek, endOfWeek);


        List<ConsumedLogResponseDto> result = new ArrayList<>();

        for (Object[] data : consumedData) {
            Long categoryId = (Long) data[0];
            String categoryName = (String) data[1];
            Long totalConsumedQuantity = (Long) data[2];

            ConsumedLogResponseDto dto = ConsumedLogResponseDto.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalConsumedQuantity(totalConsumedQuantity.intValue())
                    .build();

            result.add(dto);
        }

        return result;
    }

    public List<ConsumedLogResponseDto> getAllLogs(Long userId) {



        List<ConsumedLogResponseDto> result = consumedLogRepository.findAll().stream()
                .map(ConsumedLogResponseDto::fromEntity) // 생성자를 통해 DTO로 변환
                .collect(Collectors.toList());


        return result;
    }

}
