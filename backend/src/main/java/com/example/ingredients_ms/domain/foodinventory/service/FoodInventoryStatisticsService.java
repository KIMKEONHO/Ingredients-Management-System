package com.example.ingredients_ms.domain.foodinventory.service;

import com.example.ingredients_ms.domain.foodinventory.dto.response.ConsumedRankResponseDto;
import com.example.ingredients_ms.domain.foodinventory.dto.response.WasteStatisticsResponseDto;
import com.example.ingredients_ms.domain.foodinventory.repository.FoodInventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
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

    @Transactional
    public List<ConsumedRankResponseDto> mostConsumedStatistics(long userId) {

        List<FoodInventoryRepository.IngredientStatsProjection> inventories =
                foodInventoryRepository.findTopConsumedByUserId(userId, PageRequest.of(0, 5));

        AtomicInteger rankCounter = new AtomicInteger(1); // 순위 카운터

        return inventories.stream()
                .map(p -> {
                    long consumedQty = p.getConsumedQty() != null ? p.getConsumedQty() : 0L;

                    return ConsumedRankResponseDto.builder()
                            .rank(rankCounter.getAndIncrement()) // 순위 부여
                            .ingredientName(p.getIngredientName())
                            .ingredientId(p.getIngredientId())
                            .consumedCount(consumedQty)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
