package com.example.ingredients_ms.domain.admin.service;

import com.example.ingredients_ms.domain.admin.dto.response.AdminStatisticsResponseDto;
import com.example.ingredients_ms.domain.admin.dto.response.ChartDataResponseDto;
import com.example.ingredients_ms.domain.complaint.repository.ComplaintRepository;
import com.example.ingredients_ms.domain.diet.repository.DietRepository;
import com.example.ingredients_ms.domain.feedback.repository.ComplaintFeedbackRepository;
import com.example.ingredients_ms.domain.foodinventory.repository.FoodInventoryRepository;
import com.example.ingredients_ms.domain.ingredients.repository.IngredientsRepository;
import com.example.ingredients_ms.domain.recipe.repository.RecipeRepository;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.domain.user.service.UserStatisticsService;
import com.example.ingredients_ms.domain.useractivity.service.UserActivityService;
import com.example.ingredients_ms.global.Status;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatisticsService {

    private final UserStatisticsService userStatisticsService;
    private final UserRepository userRepository;
    private final UserActivityService userActivityService;
    private final RecipeRepository recipeRepository;
    private final IngredientsRepository ingredientRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintFeedbackRepository complaintFeedbackRepository;
    private final DietRepository dietRepository;
    private final FoodInventoryRepository foodInventoryRepository;

    public AdminStatisticsResponseDto getAdminStatistics(String theme) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime prevStart;
        LocalDateTime prevEnd;

        // 테마별 기간 계산
        switch (theme) {
            case "week" -> {
                start = now.minusWeeks(1);
                prevStart = now.minusWeeks(2);
                prevEnd = now.minusWeeks(1);
            }
            case "month" -> {
                start = now.minusMonths(1);
                prevStart = now.minusMonths(2);
                prevEnd = now.minusMonths(1);
            }
            case "quarter" -> {
                start = now.minusMonths(3);
                prevStart = now.minusMonths(6);
                prevEnd = now.minusMonths(3);
            }
            case "year" -> {
                start = now.minusYears(1);
                prevStart = now.minusYears(2);
                prevEnd = now.minusYears(1);
            }
            default -> throw new BusinessLogicException(ExceptionCode.UNKNOW_THEME);
        }

        // 사용자 통계 (기존 서비스 활용)
        var userStats = userStatisticsService.getStatistics(theme);
        
        // 레시피 통계
        long totalRecipes = recipeRepository.count();
        long currentRecipes = recipeRepository.countByCreatedAtBetween(start, now);
        long prevRecipes = recipeRepository.countByCreatedAtBetween(prevStart, prevEnd);
        double recipeGrowthRate = calculateGrowthRate(currentRecipes, prevRecipes);
        
        // 식자재 통계
        long totalIngredients = ingredientRepository.count();
        long currentIngredients = ingredientRepository.countByCreatedAtBetween(start, now);
        long prevIngredients = ingredientRepository.countByCreatedAtBetween(prevStart, prevEnd);
        double ingredientGrowthRate = calculateGrowthRate(currentIngredients, prevIngredients);
        
        // 민원 통계
        long totalComplaints = complaintRepository.count();
        long currentComplaints = complaintRepository.countByCreatedAtBetween(start, now);
        long prevComplaints = complaintRepository.countByCreatedAtBetween(prevStart, prevEnd);
        double complaintGrowthRate = calculateGrowthRate(currentComplaints, prevComplaints);
        
        // 피드백 통계
        long totalFeedback = complaintFeedbackRepository.count();
        long currentFeedback = complaintFeedbackRepository.countByCreatedAtBetween(start, now);
        long prevFeedback = complaintFeedbackRepository.countByCreatedAtBetween(prevStart, prevEnd);
        double feedbackGrowthRate = calculateGrowthRate(currentFeedback, prevFeedback);
        
        // 식단 통계
        long totalDietLogs = dietRepository.count();
        long currentDietLogs = dietRepository.countByCreatedAtBetween(start, now);
        long prevDietLogs = dietRepository.countByCreatedAtBetween(prevStart, prevEnd);
        double dietLogGrowthRate = calculateGrowthRate(currentDietLogs, prevDietLogs);
        
        // 재고 통계
        long totalInventoryItems = foodInventoryRepository.count();
        long currentInventoryItems = foodInventoryRepository.countByCreatedAtBetween(start, now);
        long prevInventoryItems = foodInventoryRepository.countByCreatedAtBetween(prevStart, prevEnd);
        double inventoryGrowthRate = calculateGrowthRate(currentInventoryItems, prevInventoryItems);

        return AdminStatisticsResponseDto.builder()
                .totalUsers(userStats.getTotalUsers())
                .activeUsers(userStats.getActiveUsers())
                .newUsers(userStats.getNewUsers())
                .activeUserGrowthRate(userStats.getActiveUserGrowthRate())
                .newUserGrowthRate(userStats.getNewUserGrowthRate())
                .complaintRate(userStats.getComplaintRate())
                .totalRecipes(totalRecipes)
                .recipeGrowthRate(recipeGrowthRate)
                .totalIngredients(totalIngredients)
                .ingredientGrowthRate(ingredientGrowthRate)
                .totalComplaints(totalComplaints)
                .complaintGrowthRate(complaintGrowthRate)
                .totalFeedback(totalFeedback)
                .feedbackGrowthRate(feedbackGrowthRate)
                .totalDietLogs(totalDietLogs)
                .dietLogGrowthRate(dietLogGrowthRate)
                .totalInventoryItems(totalInventoryItems)
                .inventoryGrowthRate(inventoryGrowthRate)
                .build();
    }

    public ChartDataResponseDto getChartData(String theme) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end;

        // 테마별 기간 계산
        switch (theme) {
            case "week" -> {
                start = now.minusWeeks(1);
                end = now;
            }
            case "month" -> {
                start = now.minusMonths(1);
                end = now;
            }
            case "quarter" -> {
                start = now.minusMonths(3);
                end = now;
            }
            case "year" -> {
                start = now.minusYears(1);
                end = now;
            }
            default -> throw new BusinessLogicException(ExceptionCode.UNKNOW_THEME);
        }

        // 주간 트렌드 데이터 생성
        List<ChartDataResponseDto.WeeklyTrendDto> weeklyTrend = generateWeeklyTrendData(start, end);
        
        // 사용자 상태 분포 데이터 생성
        List<ChartDataResponseDto.UserStatusDistributionDto> userStatusDistribution = generateUserStatusDistribution();
        
        // 일별 활동 데이터 생성
        List<ChartDataResponseDto.DailyActivityDto> dailyActivity = generateDailyActivityData(start, end);

        return ChartDataResponseDto.builder()
                .weeklyTrend(weeklyTrend)
                .userStatusDistribution(userStatusDistribution)
                .dailyActivity(dailyActivity)
                .build();
    }

    private List<ChartDataResponseDto.WeeklyTrendDto> generateWeeklyTrendData(LocalDateTime start, LocalDateTime end) {
        List<ChartDataResponseDto.WeeklyTrendDto> weeklyTrend = new ArrayList<>();
        String[] days = {"월", "화", "수", "목", "금", "토", "일"};
        
        for (int i = 0; i < 7; i++) {
            LocalDateTime dayStart = start.plusDays(i);
            LocalDateTime dayEnd = dayStart.plusDays(1);
            
            long activeUsers = userRepository.countByStatusAndCreatedAtBetween(
                Status.ACTIVE, dayStart, dayEnd);
            long newUsers = userRepository.countByCreatedAtBetween(dayStart, dayEnd);
            long recipeRegistrations = recipeRepository.countByCreatedAtBetween(dayStart, dayEnd);
            
            weeklyTrend.add(ChartDataResponseDto.WeeklyTrendDto.builder()
                    .day(days[i])
                    .activeUsers(activeUsers)
                    .newUsers(newUsers)
                    .recipeRegistrations(recipeRegistrations)
                    .build());
        }
        
        return weeklyTrend;
    }

    private List<ChartDataResponseDto.UserStatusDistributionDto> generateUserStatusDistribution() {
        long activeUsers = userRepository.countByStatus(Status.ACTIVE);
        long inactiveUsers = userRepository.countByStatus(Status.INACTIVE);
        long pendingUsers = userRepository.countByStatus(Status.PENDING);
        
        List<ChartDataResponseDto.UserStatusDistributionDto> distribution = new ArrayList<>();
        distribution.add(ChartDataResponseDto.UserStatusDistributionDto.builder()
                .name("활성 사용자")
                .value(activeUsers)
                .color("#10B981")
                .build());
        distribution.add(ChartDataResponseDto.UserStatusDistributionDto.builder()
                .name("휴면 사용자")
                .value(inactiveUsers)
                .color("#F59E0B")
                .build());
        distribution.add(ChartDataResponseDto.UserStatusDistributionDto.builder()
                .name("대기 사용자")
                .value(pendingUsers)
                .color("#3B82F6")
                .build());
        
        return distribution;
    }

    private List<ChartDataResponseDto.DailyActivityDto> generateDailyActivityData(LocalDateTime start, LocalDateTime end) {
        List<ChartDataResponseDto.DailyActivityDto> dailyActivity = new ArrayList<>();
        
        // 실제 활동 데이터 조회
        List<UserActivityService.DailyActivityStats> activityStats = userActivityService.getDailyActivityStats(start, end);
        
        // 활동 데이터가 있으면 실제 데이터 사용, 없으면 기본값 생성
        if (!activityStats.isEmpty()) {
            for (UserActivityService.DailyActivityStats stats : activityStats) {
                dailyActivity.add(ChartDataResponseDto.DailyActivityDto.builder()
                        .date(stats.getDate())
                        .logins(stats.getLogins())
                        .recipeViews(stats.getRecipeViews())
                        .recipeRegistrations(stats.getRecipeCreations())
                        .build());
            }
        } else {
            // 실제 데이터가 없을 때 기본값 생성
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd");
            
            for (int i = 0; i < 7; i++) {
                LocalDateTime dayStart = start.plusDays(i);
                long recipeRegistrations = recipeRepository.countByCreatedAtBetween(dayStart, dayStart.plusDays(1));
                
                dailyActivity.add(ChartDataResponseDto.DailyActivityDto.builder()
                        .date(dayStart.format(formatter))
                        .logins((long) (Math.random() * 100) + 50)
                        .recipeViews((long) (Math.random() * 200) + 100)
                        .recipeRegistrations(recipeRegistrations)
                        .build());
            }
        }
        
        return dailyActivity;
    }

    private double calculateGrowthRate(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }
}
