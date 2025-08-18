package com.example.ingredients_ms.domain.foodinventory.service;

import com.example.ingredients_ms.domain.foodinventory.dto.response.WasteStatisticsResponseDto;
import com.example.ingredients_ms.domain.foodinventory.repository.FoodInventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodInventoryStatisticsService {

    private final FoodInventoryRepository foodInventoryRepository;

    @Transactional
    public List<WasteStatisticsResponseDto> consumedStatistics(long userId){

        List<FoodInventoryRepository.IngredientStatsProjection> inventories = foodInventoryRepository.findIngredientStatsByUserId(userId);

        return inventories.stream()
                .map(p -> {
                    long totalQty = p.getTotalQty() != null ? p.getTotalQty() : 0L;
                    long wastedQty = p.getWastedQty() != null ? p.getWastedQty() : 0L;
                    long consumedQty = p.getConsumedQty() != null ? p.getConsumedQty() : 0L;

                    double wasteRate = totalQty > 0 ? (wastedQty * 100.0) / totalQty : 0.0;
                    double consumedRate = totalQty > 0 ? (consumedQty * 100.0) / totalQty : 0.0;

                    return WasteStatisticsResponseDto.builder()
                            .ingredientId(p.getIngredientId())
                            .ingredientName(p.getIngredientName())
                            .totalWastedCount((int) wastedQty)
                            .consumedCount((int) consumedQty)
                            .wasteRate(wasteRate)
                            .consumedRate(consumedRate)
                            .build();
                })
                .collect(Collectors.toList());

    }
}
