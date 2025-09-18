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

}
