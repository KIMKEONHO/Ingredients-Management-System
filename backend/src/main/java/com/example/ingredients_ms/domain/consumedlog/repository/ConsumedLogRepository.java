package com.example.ingredients_ms.domain.consumedlog.repository;

import com.example.ingredients_ms.domain.consumedlog.entity.ConsumedLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ConsumedLogRepository extends JpaRepository <ConsumedLog, Long> {


    // 카테고리별 이번달 사용량 조회 (단위: g)
    @Query("SELECT cl.inventory.ingredient.category.id as categoryId, " +
           "cl.inventory.ingredient.category.name as categoryName, " +
           "SUM(cl.consumedQuantity) as totalConsumedQuantity " +
           "FROM ConsumedLog cl " +
           "WHERE cl.user.id = :userId " +
           "AND cl.consumedDate BETWEEN :startDate AND :endDate " +
           "GROUP BY cl.inventory.ingredient.category.id, cl.inventory.ingredient.category.name")
    List<Object[]> findConsumedQuantityByCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // 이번년도 월별 카테고리별 사용량 조회 (단위: g)
    @Query("SELECT MONTH(cl.consumedDate) as month, " +
           "cl.inventory.ingredient.category.id as categoryId, " +
           "cl.inventory.ingredient.category.name as categoryName, " +
           "SUM(cl.consumedQuantity) as totalConsumedQuantity " +
           "FROM ConsumedLog cl " +
           "WHERE cl.user.id = :userId " +
           "AND YEAR(cl.consumedDate) = :year " +
           "GROUP BY MONTH(cl.consumedDate), cl.inventory.ingredient.category.id, cl.inventory.ingredient.category.name " +
           "ORDER BY MONTH(cl.consumedDate), cl.inventory.ingredient.category.id")
    List<Object[]> findMonthlyConsumedQuantityByCategory(
            @Param("userId") Long userId,
            @Param("year") int year);

    List<ConsumedLog> findByUser_IdAndConsumedDateBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

}
