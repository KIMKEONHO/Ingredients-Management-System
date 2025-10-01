package com.example.ingredients_ms.domain.useractivity.repository;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.useractivity.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    // 특정 사용자의 활동 로그 조회
    List<UserActivity> findByUserOrderByCreatedAtDesc(User user);

    // 특정 기간 내 활동 로그 조회
    List<UserActivity> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    // 특정 활동 타입의 활동 로그 조회
    List<UserActivity> findByActivityTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            UserActivity.ActivityType activityType, LocalDateTime start, LocalDateTime end);

    // 특정 사용자의 특정 활동 타입 조회
    List<UserActivity> findByUserAndActivityTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            User user, UserActivity.ActivityType activityType, LocalDateTime start, LocalDateTime end);

    // 일별 로그인 수 집계
    @Query("""
        SELECT DATE(ua.createdAt) as date, COUNT(ua) as count
        FROM UserActivity ua
        WHERE ua.activityType = :activityType
        AND ua.createdAt BETWEEN :start AND :end
        GROUP BY DATE(ua.createdAt)
        ORDER BY DATE(ua.createdAt)
        """)
    List<Object[]> countActivityByDate(
            @Param("activityType") UserActivity.ActivityType activityType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 일별 레시피 조회 수 집계
    @Query("""
        SELECT DATE(ua.createdAt) as date, COUNT(ua) as count
        FROM UserActivity ua
        WHERE ua.activityType = 'RECIPE_VIEW'
        AND ua.createdAt BETWEEN :start AND :end
        GROUP BY DATE(ua.createdAt)
        ORDER BY DATE(ua.createdAt)
        """)
    List<Object[]> countRecipeViewsByDate(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 일별 레시피 생성 수 집계
    @Query("""
        SELECT DATE(ua.createdAt) as date, COUNT(ua) as count
        FROM UserActivity ua
        WHERE ua.activityType = 'RECIPE_CREATE'
        AND ua.createdAt BETWEEN :start AND :end
        GROUP BY DATE(ua.createdAt)
        ORDER BY DATE(ua.createdAt)
        """)
    List<Object[]> countRecipeCreationsByDate(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 최근 7일간의 활동 통계
    @Query("""
        SELECT 
            DATE(ua.createdAt) as date,
            SUM(CASE WHEN ua.activityType = 'LOGIN' THEN 1 ELSE 0 END) as logins,
            SUM(CASE WHEN ua.activityType = 'RECIPE_VIEW' THEN 1 ELSE 0 END) as recipeViews,
            SUM(CASE WHEN ua.activityType = 'RECIPE_CREATE' THEN 1 ELSE 0 END) as recipeCreations
        FROM UserActivity ua
        WHERE ua.createdAt BETWEEN :start AND :end
        GROUP BY DATE(ua.createdAt)
        ORDER BY DATE(ua.createdAt)
        """)
    List<Object[]> getDailyActivityStats(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
