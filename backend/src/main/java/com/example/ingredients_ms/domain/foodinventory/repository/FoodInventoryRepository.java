package com.example.ingredients_ms.domain.foodinventory.repository;

import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.domain.foodinventory.entity.Place;
import lombok.extern.java.Log;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 냉장고 데이터베이스 관리자, JpaRepository님만 믿습니다!
public interface FoodInventoryRepository extends JpaRepository<FoodInventory, Long> {
    // 특정 유저의 모든 재료를 ID 순으로 정렬해서 찾아줘!
    List<FoodInventory> findByUser_IdOrderById(Long userId);

    Optional<FoodInventory> findByUser_IdAndId(Long userId,Long id);

    List<FoodInventory> findByUser_IdAndIngredient_Category_IdOrderById(Long userId, Long categoryId);

    List<FoodInventory> findByUser_IdAndPlaces(Long userId, Place place);

    boolean existsByUser_IdAndId(Long userId, Long id);

}
