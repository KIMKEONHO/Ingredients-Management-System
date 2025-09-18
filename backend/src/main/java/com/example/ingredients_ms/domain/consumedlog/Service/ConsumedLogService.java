package com.example.ingredients_ms.domain.consumedlog.Service;


import com.example.ingredients_ms.domain.consumedlog.dto.response.ConsumedLogResponseDto;
import com.example.ingredients_ms.domain.consumedlog.repository.ConsumedLogRepository;
import com.example.ingredients_ms.domain.ingredientscategory.repository.IngredientsCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConsumedLogService {

    private final ConsumedLogRepository consumedLogRepository;
    private final IngredientsCategoryRepository ingredientsCategoryRepository;

    /**
     * 카테고리별 이번달 식품재고 사용량을 조회합니다.
     * @param userId 사용자 ID
     * @return 카테고리별 사용량 정보 리스트
     */
    public List<ConsumedLogResponseDto> getConsumedLogByCategory(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        YearMonth currentMonth = YearMonth.from(now);
        
        // 이번 달 시작일과 종료일
        LocalDateTime startDate = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // 카테고리별 사용량 조회
        List<Object[]> consumedData = consumedLogRepository.findConsumedQuantityByCategoryAndDateRange(
                userId, startDate, endDate);

        
        // 결과 DTO 리스트 생성
        List<ConsumedLogResponseDto> result = new ArrayList<>();
        
        for (Object[] data : consumedData) {
            Long categoryId = (Long) data[0];
            String categoryName = (String) data[1];
            Long totalConsumedQuantity = (Long) data[2];
            
            ConsumedLogResponseDto dto = ConsumedLogResponseDto.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .totalConsumedQuantity(totalConsumedQuantity.intValue())
                    .build();
            
            result.add(dto);
        }
        
        return result;
    }
}
