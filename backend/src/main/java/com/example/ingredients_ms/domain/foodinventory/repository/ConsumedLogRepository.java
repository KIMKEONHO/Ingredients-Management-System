package com.example.ingredients_ms.domain.foodinventory.repository;

import com.example.ingredients_ms.domain.foodinventory.entity.ConsumedLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsumedLogRepository extends JpaRepository <ConsumedLog, Long> {



}
