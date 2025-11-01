package com.example.ingredients_ms.domain.foodinventory.repository;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus;
import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 냉장고 데이터베이스 관리자, JpaRepository님만 믿습니다!
public interface FoodInventoryRepository extends JpaRepository<FoodInventory, Long> {

    List<FoodInventory> findByUser_IdAndIsDeletedFalseOrderById(Long userId);

    Optional<FoodInventory> findByUser_IdAndIdAndIsDeletedFalse(Long userId, Long id);

    List<FoodInventory> findByUser_IdAndIngredient_Category_IdAndIsDeletedFalseOrderById(Long userId, Long categoryId);

    List<FoodInventory> findByUser_IdAndPlaceAndIsDeletedFalse(Long userId, Place place);

    List<FoodInventory> findByUser_IdAndStatus(Long userId, FoodStatus status);


    // 만료 임박 식재료 조회 (3일 이내)
    @Query("SELECT fi FROM FoodInventory fi WHERE fi.status = 'NORMAL' AND fi.expirationDate <= :threeDaysLater AND fi.expirationDate > :now")
    List<FoodInventory> findExpiringSoonIngredients(@Param("now") LocalDateTime now, @Param("threeDaysLater") LocalDateTime threeDaysLater);

    // 만료된 식재료 조회 (오늘 날짜 포함하여 만료된 것들)
    // 내일 자정 이전의 식재료를 만료로 처리 (오늘 날짜까지 포함)
    @Query("SELECT fi FROM FoodInventory fi WHERE fi.status = 'NORMAL' AND fi.expirationDate < :startOfTomorrow")
    List<FoodInventory> findExpiredIngredients(@Param("startOfTomorrow") LocalDateTime startOfTomorrow);

    // 상태별 식재료 조회
    List<FoodInventory> findByStatus(FoodStatus status);

    // 상태 업데이트 (배치 처리용)
    @Modifying
    @Query("UPDATE FoodInventory fi SET fi.status = :newStatus WHERE fi.id IN :ids")
    void updateStatusByIds(@Param("ids") List<Long> ids, @Param("newStatus") FoodStatus newStatus);

    // 예시 Projection
    public interface IngredientStatsProjection {
        Long getIngredientId();
        String getIngredientName();
        Long getTotalQty();
        Long getWastedQty();
        Long getConsumedQty();
    }

    // 예시 Repository 메서드 (JPQL)
    @Query("""
select fi.ingredient.id as ingredientId,
       fi.ingredient.name as ingredientName,
       sum(fi.originalQuantity) as totalQty,
       sum(case when fi.status = com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus.EXPIRED
                then fi.quantity else 0 end) as wastedQty,
       sum(case when fi.status = com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus.CONSUMED
                then (fi.originalQuantity - fi.quantity) else 0 end) as consumedQty
from FoodInventory fi
where fi.user.id = :userId
group by fi.ingredient.id, fi.ingredient.name
""")
    List<IngredientStatsProjection> findIngredientStatsByUserId(@Param("userId") long userId);

    // 가장 많이 소비된 식재료(top1)
    @Query("""
select fi.ingredient.id as ingredientId,
       fi.ingredient.name as ingredientName,
       sum(case when fi.status = com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus.CONSUMED
                then (fi.originalQuantity - fi.quantity) else 0 end) as consumedQty,
       0 as wastedQty
from FoodInventory fi
where fi.user.id = :userId
group by fi.ingredient.id, fi.ingredient.name
order by consumedQty desc
""")
    List<IngredientStatsProjection> findTopConsumedByUserId(@Param("userId") long userId, Pageable pageable);

    // 통계용 메서드
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}
