package com.example.ingredients_ms.domain.useractivity.service;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.useractivity.entity.UserActivity;
import com.example.ingredients_ms.domain.useractivity.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;

    /**
     * 사용자 활동 로그 기록
     */
    @Transactional
    public void logActivity(User user, UserActivity.ActivityType activityType, String description, String metadata) {
        try {
            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .activityType(activityType)
                    .description(description)
                    .metadata(metadata)
                    .build();

            userActivityRepository.save(activity);
            log.debug("사용자 활동 로그 기록: {} - {}", user.getEmail(), activityType.getDescription());
        } catch (Exception e) {
            log.error("사용자 활동 로그 기록 실패: {} - {}", user.getEmail(), activityType.getDescription(), e);
        }
    }

    /**
     * 로그인 활동 로그 기록
     */
    @Transactional
    public void logLogin(User user) {
        logActivity(user, UserActivity.ActivityType.LOGIN, "사용자 로그인", null);
    }

    /**
     * 로그아웃 활동 로그 기록
     */
    @Transactional
    public void logLogout(User user) {
        logActivity(user, UserActivity.ActivityType.LOGOUT, "사용자 로그아웃", null);
    }

    /**
     * 레시피 조회 활동 로그 기록
     */
    @Transactional
    public void logRecipeView(User user, Long recipeId, String recipeTitle) {
        String metadata = String.format("{\"recipeId\": %d, \"recipeTitle\": \"%s\"}", recipeId, recipeTitle);
        logActivity(user, UserActivity.ActivityType.RECIPE_VIEW, "레시피 조회: " + recipeTitle, metadata);
    }

    /**
     * 레시피 생성 활동 로그 기록
     */
    @Transactional
    public void logRecipeCreate(User user, Long recipeId, String recipeTitle) {
        String metadata = String.format("{\"recipeId\": %d, \"recipeTitle\": \"%s\"}", recipeId, recipeTitle);
        logActivity(user, UserActivity.ActivityType.RECIPE_CREATE, "레시피 생성: " + recipeTitle, metadata);
    }

    /**
     * 레시피 좋아요 활동 로그 기록
     */
    @Transactional
    public void logRecipeLike(User user, Long recipeId, String recipeTitle) {
        String metadata = String.format("{\"recipeId\": %d, \"recipeTitle\": \"%s\"}", recipeId, recipeTitle);
        logActivity(user, UserActivity.ActivityType.RECIPE_LIKE, "레시피 좋아요: " + recipeTitle, metadata);
    }

    /**
     * 최근 7일간의 일별 활동 통계 조회
     */
    public List<DailyActivityStats> getDailyActivityStats(LocalDateTime start, LocalDateTime end) {
        List<Object[]> results = userActivityRepository.getDailyActivityStats(start, end);
        List<DailyActivityStats> stats = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd");

        for (Object[] result : results) {
            LocalDate date = ((java.sql.Date) result[0]).toLocalDate();
            Long logins = (Long) result[1];
            Long recipeViews = (Long) result[2];
            Long recipeCreations = (Long) result[3];

            stats.add(DailyActivityStats.builder()
                    .date(date.format(formatter))
                    .logins(logins != null ? logins : 0L)
                    .recipeViews(recipeViews != null ? recipeViews : 0L)
                    .recipeCreations(recipeCreations != null ? recipeCreations : 0L)
                    .build());
        }

        return stats;
    }

    /**
     * 일별 활동 통계 DTO
     */
    @lombok.Builder
    @lombok.Getter
    public static class DailyActivityStats {
        private final String date;
        private final long logins;
        private final long recipeViews;
        private final long recipeCreations;
    }
}
