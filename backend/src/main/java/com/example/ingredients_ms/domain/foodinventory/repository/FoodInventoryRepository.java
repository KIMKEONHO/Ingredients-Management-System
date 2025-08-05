package com.example.ingredients_ms.domain.foodinventory.repository;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 냉장고 데이터베이스 관리자, JpaRepository님만 믿습니다!
public interface FoodInventoryRepository extends JpaRepository<FoodInventory, Long> {
    // 특정 유저의 모든 재료를 ID 순으로 정렬해서 찾아줘!
    List<FoodInventory> findByUser_IdOrderById(Long userId);

    List<FoodInventory> findByUser_IdAndIngredient_Category_IdOrderById(Long userId, Long categoryId);

}
