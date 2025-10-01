package com.example.ingredients_ms.domain.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatisticsResponseDto {
    // 사용자 통계
    private final long totalUsers;
    private final long activeUsers;
    private final long newUsers;
    private final double activeUserGrowthRate;
    private final double newUserGrowthRate;
    private final double complaintRate;
    
    // 레시피 통계
    private final long totalRecipes;
    private final double recipeGrowthRate;
    
    // 식자재 통계
    private final long totalIngredients;
    private final double ingredientGrowthRate;
    
    // 민원 통계
    private final long totalComplaints;
    private final double complaintGrowthRate;
    
    // 피드백 통계
    private final long totalFeedback;
    private final double feedbackGrowthRate;
    
    // 식단 통계
    private final long totalDietLogs;
    private final double dietLogGrowthRate;
    
    // 재고 통계
    private final long totalInventoryItems;
    private final double inventoryGrowthRate;
}


