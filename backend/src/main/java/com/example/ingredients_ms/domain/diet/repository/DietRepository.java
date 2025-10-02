package com.example.ingredients_ms.domain.diet.repository;

import com.example.ingredients_ms.domain.diet.entity.Diet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DietRepository extends JpaRepository<Diet,Long> {
    List<Diet> findAllByUserIdAndDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
    List<Diet> findByUserIdAndDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
    
    // 통계용 메서드
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
