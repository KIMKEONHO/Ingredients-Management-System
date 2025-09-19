package com.example.ingredients_ms.domain.diet.service;

import com.example.ingredients_ms.domain.diet.dto.request.CreateDietRequestDto;
import com.example.ingredients_ms.domain.diet.dto.request.DietRequestDto;
import com.example.ingredients_ms.domain.diet.dto.response.DietResponseDto;
import com.example.ingredients_ms.domain.diet.entity.Diet;
import com.example.ingredients_ms.domain.diet.entity.MealType;
import com.example.ingredients_ms.domain.diet.repository.DietRepository;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.example.ingredients_ms.global.exeption.ExceptionCode.DIET_NOT_FOUND;
import static com.example.ingredients_ms.global.exeption.ExceptionCode.NOT_OWNER;

@Service
@RequiredArgsConstructor
public class DietService {

    private final DietRepository dietRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addDiet(Long userId, CreateDietRequestDto requestDto){
        Optional<User> opUser = userRepository.findById(userId);

        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();
        Diet diet = Diet.builder()
                .user(user)
                .date(requestDto.getDate())
                .menu(requestDto.getMenu())
                .kcal(requestDto.getKcal())
                .mealType(MealType.fromValue(requestDto.getMealType()))
                .build();

        dietRepository.save(diet);
    }

    @Transactional
    public List<DietResponseDto> getAllDiets(Long userId, DietRequestDto dto) {

        LocalDateTime startDate;
        LocalDateTime endDate;

        if (dto.getDay() != null) {
            // 특정 날짜 조회
            startDate = LocalDateTime.of(dto.getYear(), dto.getMonth(), dto.getDay(), 0, 0, 0);
            endDate = LocalDateTime.of(dto.getYear(), dto.getMonth(), dto.getDay(), 23, 59, 59);
        } else {
            // 특정 달 조회
            startDate = LocalDateTime.of(dto.getYear(), dto.getMonth(), 1, 0, 0, 0);
            endDate = startDate.withDayOfMonth(startDate.toLocalDate().lengthOfMonth())
                    .with(LocalTime.MAX);
        }

        List<Diet> diets = dietRepository.findAllByUserIdAndDateBetween(userId, startDate, endDate);

        return diets.stream()
                .map(d -> DietResponseDto.builder()
                        .id(d.getId())
                        .menu(d.getMenu())
                        .kcal(d.getKcal())
                        .mealType(d.getMealType())
                        .date(d.getDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateDiet(Long userId, CreateDietRequestDto requestDto, Long dietId) {
        Optional<Diet> opDiet = dietRepository.findById(dietId);
        if(opDiet.isEmpty()){
            throw new BusinessLogicException(DIET_NOT_FOUND);
        }

        Diet diet = opDiet.get();

        if(!diet.getUser().getId().equals(userId)){
            throw new BusinessLogicException(NOT_OWNER);
        }

        diet.setMenu(requestDto.getMenu());
        diet.setDate(requestDto.getDate());
        diet.setKcal(requestDto.getKcal());
        diet.setMealType(MealType.fromValue(requestDto.getMealType()));

        dietRepository.save(diet);
    }

    @Transactional
    public void deleteDiet(Long userId, Long dietId) {
        Optional<Diet> opDiet = dietRepository.findById(dietId);

        if(opDiet.isEmpty()){
            throw new BusinessLogicException(DIET_NOT_FOUND);
        }

        Diet diet = opDiet.get();

        if(!diet.getUser().getId().equals(userId)){
            throw new BusinessLogicException(NOT_OWNER);
        }

        dietRepository.delete(diet);
    }

}
