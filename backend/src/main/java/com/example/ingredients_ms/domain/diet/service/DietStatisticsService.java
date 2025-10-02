package com.example.ingredients_ms.domain.diet.service;

import com.example.ingredients_ms.domain.diet.dto.response.DietStatisticsResponseDto;
import com.example.ingredients_ms.domain.diet.dto.response.WeekStatisticsResponseDto;
import com.example.ingredients_ms.domain.diet.entity.Diet;
import com.example.ingredients_ms.domain.diet.repository.DietRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DietStatisticsService {

    private final DietRepository dietRepository;

    @Transactional
    public DietStatisticsResponseDto monthStatistics(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        YearMonth currentMonth = YearMonth.from(now);
        YearMonth prevMonth = currentMonth.minusMonths(1);

        // 이번 달 데이터
        List<Diet> currentMonthDiets = dietRepository.findByUserIdAndDateBetween(
                userId,
                currentMonth.atDay(1).atStartOfDay(),
                currentMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        // 지난 달 데이터
        List<Diet> prevMonthDiets = dietRepository.findByUserIdAndDateBetween(
                userId,
                prevMonth.atDay(1).atStartOfDay(),
                prevMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        double currentAvg = currentMonthDiets.stream()
                .mapToInt(Diet::getKcal)
                .average()
                .orElse(0);

        double prevAvg = prevMonthDiets.stream()
                .mapToInt(Diet::getKcal)
                .average()
                .orElse(0);

        // 증감 계산 (지난달이 0이어도 값 채워주기)
        double diff = currentAvg - prevAvg;
        double diffRate = (prevAvg == 0) ? 0 : (diff / prevAvg) * 100.0;

        return DietStatisticsResponseDto.builder()
                .averageKcal(currentAvg)
                .diffFromLast(diff)
                .diffRate(diffRate)
                .build();
    }

    @Transactional
    public List<WeekStatisticsResponseDto> weekGraphStatistics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);

        List<Diet> weekDiets = dietRepository.findByUserIdAndDateBetween(
                userId,
                startDate.atStartOfDay(),
                today.atTime(23, 59, 59)
        );

        Map<LocalDate, Double> dailyAvgMap = weekDiets.stream()
                .collect(Collectors.groupingBy(
                        diet -> diet.getDate().toLocalDate(),
                        Collectors.averagingInt(Diet::getKcal)
                ));

        List<WeekStatisticsResponseDto> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            double avgKcal = dailyAvgMap.getOrDefault(date, 0.0);
            result.add(new WeekStatisticsResponseDto(date, avgKcal));
        }

        return result;
    }

    @Transactional
    public DietStatisticsResponseDto quarterStatistics(Long userId) {
        LocalDate now = LocalDate.now();
        int currentQuarter = (now.getMonthValue() - 1) / 3 + 1;
        int prevQuarter = (currentQuarter == 1) ? 4 : currentQuarter - 1;
        int year = now.getYear();
        int prevYear = (currentQuarter == 1) ? year - 1 : year;

        // 이번 분기 기간
        LocalDate quarterStart = LocalDate.of(year, (currentQuarter - 1) * 3 + 1, 1);
        LocalDate quarterEnd = quarterStart.plusMonths(3).minusDays(1);

        // 지난 분기 기간
        LocalDate prevQuarterStart = LocalDate.of(prevYear, (prevQuarter - 1) * 3 + 1, 1);
        LocalDate prevQuarterEnd = prevQuarterStart.plusMonths(3).minusDays(1);

        // 데이터 조회
        List<Diet> currentQuarterDiets = dietRepository.findByUserIdAndDateBetween(
                userId, quarterStart.atStartOfDay(), quarterEnd.atTime(23, 59, 59));
        List<Diet> prevQuarterDiets = dietRepository.findByUserIdAndDateBetween(
                userId, prevQuarterStart.atStartOfDay(), prevQuarterEnd.atTime(23, 59, 59));

        double currentAvg = currentQuarterDiets.stream().mapToInt(Diet::getKcal).average().orElse(0);
        double prevAvg = prevQuarterDiets.stream().mapToInt(Diet::getKcal).average().orElse(0);

        double diff = currentAvg - prevAvg;
        double diffRate = (prevAvg == 0) ? 0 : (diff / prevAvg) * 100.0;

        return DietStatisticsResponseDto.builder()
                .averageKcal(currentAvg)
                .diffFromLast(diff)
                .diffRate(diffRate)
                .build();
    }

    @Transactional
    public DietStatisticsResponseDto yearStatistics(Long userId) {
        int year = LocalDate.now().getYear();
        int prevYear = year - 1;

        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd = LocalDate.of(year, 12, 31);

        LocalDate prevYearStart = LocalDate.of(prevYear, 1, 1);
        LocalDate prevYearEnd = LocalDate.of(prevYear, 12, 31);

        List<Diet> currentYearDiets = dietRepository.findByUserIdAndDateBetween(
                userId, yearStart.atStartOfDay(), yearEnd.atTime(23, 59, 59));
        List<Diet> prevYearDiets = dietRepository.findByUserIdAndDateBetween(
                userId, prevYearStart.atStartOfDay(), prevYearEnd.atTime(23, 59, 59));

        double currentAvg = currentYearDiets.stream().mapToInt(Diet::getKcal).average().orElse(0);
        double prevAvg = prevYearDiets.stream().mapToInt(Diet::getKcal).average().orElse(0);

        double diff = currentAvg - prevAvg;
        double diffRate = (prevAvg == 0) ? 0 : (diff / prevAvg) * 100.0;

        return DietStatisticsResponseDto.builder()
                .averageKcal(currentAvg)
                .diffFromLast(diff)
                .diffRate(diffRate)
                .build();
    }

    @Transactional
    public DietStatisticsResponseDto weekStatistics(Long userId) {
        LocalDate today = LocalDate.now();

        // 이번 주 (월요일 ~ 일요일)
        LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);

        // 지난 주
        LocalDate prevWeekStart = weekStart.minusWeeks(1);
        LocalDate prevWeekEnd = prevWeekStart.plusDays(6);

        List<Diet> currentWeekDiets = dietRepository.findByUserIdAndDateBetween(
                userId, weekStart.atStartOfDay(), weekEnd.atTime(23, 59, 59));
        List<Diet> prevWeekDiets = dietRepository.findByUserIdAndDateBetween(
                userId, prevWeekStart.atStartOfDay(), prevWeekEnd.atTime(23, 59, 59));

        double currentAvg = currentWeekDiets.stream().mapToInt(Diet::getKcal).average().orElse(0);
        double prevAvg = prevWeekDiets.stream().mapToInt(Diet::getKcal).average().orElse(0);

        double diff = currentAvg - prevAvg;
        double diffRate = (prevAvg == 0) ? 0 : (diff / prevAvg) * 100.0;

        return DietStatisticsResponseDto.builder()
                .averageKcal(currentAvg)
                .diffFromLast(diff)
                .diffRate(diffRate)
                .build();
    }
}
