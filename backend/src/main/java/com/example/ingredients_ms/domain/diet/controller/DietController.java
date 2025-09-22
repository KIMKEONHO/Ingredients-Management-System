package com.example.ingredients_ms.domain.diet.controller;

import com.example.ingredients_ms.domain.diet.dto.request.CreateDietRequestDto;
import com.example.ingredients_ms.domain.diet.dto.request.DietRequestDto;
import com.example.ingredients_ms.domain.diet.dto.response.DietResponseDto;
import com.example.ingredients_ms.domain.diet.service.DietService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diet")
@RequiredArgsConstructor
public class DietController {

    private final DietService dietService;

    // 식단 추가
    @PostMapping("/add")
    public RsData<?> addDiet(
            @CurrentUser SecurityUser currentUser,
            @RequestBody CreateDietRequestDto requestDto
    ){

        dietService.addDiet(currentUser.getId(), requestDto);

        return new RsData<>("201", "식단이 추가되었습니다.");
    }

    // 월간 식단 조회
    @GetMapping("/{year}/{month}")
    public RsData<?> getDiet(
            @CurrentUser SecurityUser securityUser,
            @PathVariable("year") int year,
            @PathVariable("month") int month
    ){

        DietRequestDto  requestDto = DietRequestDto.builder()
                .year(year)
                .month(month)
                .build();

        List<DietResponseDto> diets = dietService.getAllDiets(securityUser.getId(),requestDto);

        return new RsData<>("200", requestDto.getMonth() + "월의 식단을 가져왔습니다.", diets);
    }

    //수정
    @PatchMapping("/{dietId}")
    public RsData<?> updateDiet(
            @CurrentUser SecurityUser securityUser,
            @RequestBody CreateDietRequestDto requestDto,
            @PathVariable Long dietId
    ){

        dietService.updateDiet(securityUser.getId(), requestDto, dietId);

        return new RsData<>("204", "식단이 업데이트 되었습니다.");
    }

    //삭제
    @DeleteMapping("/{dietId}")
    public RsData<?> deleteDiet(
            @CurrentUser SecurityUser securityUser,
            @PathVariable Long dietId
    ){

        dietService.deleteDiet(securityUser.getId(), dietId);

        return new RsData<>("204", "식단이 삭제되었습니다.");
    }

}
