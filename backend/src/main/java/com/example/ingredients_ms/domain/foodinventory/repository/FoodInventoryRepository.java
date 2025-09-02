package com.example.ingredients_ms.domain.foodinventory.repository;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodStatus;
import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// 냉장고 데이터베이스 관리자, JpaRepository님만 믿습니다!
public interface FoodInventoryRepository extends JpaRepository<FoodInventory, Long> {
    // 특정 유저의 모든 재료를 ID 순으로 정렬해서 찾아줘!
    List<FoodInventory> findByUser_IdOrderById(Long userId);

    Optional<FoodInventory> findByUser_IdAndId(Long userId,Long id);

    List<FoodInventory> findByUser_IdAndIngredient_Category_IdOrderById(Long userId, Long categoryId);

    List<FoodInventory> findByUser_IdAndPlace(Long userId, Place place);

    List<FoodInventory> findByUser_IdAndStatus(Long userId, FoodStatus status);

    boolean existsByUser_IdAndId(Long userId, Long id);

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

}
