package com.example.ingredients_ms.domain.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ChartDataResponseDto {
    private final List<WeeklyTrendDto> weeklyTrend;
    private final List<UserStatusDistributionDto> userStatusDistribution;
    private final List<DailyActivityDto> dailyActivity;

    @Getter
    @Builder
    public static class WeeklyTrendDto {
        private final String day;
        private final long activeUsers;
        private final long newUsers;
        private final long recipeRegistrations;
    }

    @Getter
    @Builder
    public static class UserStatusDistributionDto {
        private final String name;
        private final long value;
        private final String color;
    }

    @Getter
    @Builder
    public static class DailyActivityDto {
        private final String date;
        private final long logins;
        private final long recipeViews;
        private final long recipeRegistrations;
    }
}
