package com.example.ingredients_ms.domain.user.service;

import com.example.ingredients_ms.domain.complaint.service.ComplaintStatisticsService;
import com.example.ingredients_ms.domain.user.dto.response.AllUserStatisticsResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.UserStatisticsResponseDto;
import com.example.ingredients_ms.domain.user.entity.Role;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.Status;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import static com.example.ingredients_ms.global.exeption.ExceptionCode.UNKNOW_THEME;

@Service
@RequiredArgsConstructor
public class UserStatisticsService {

    private final UserRepository userRepository;
    private final ComplaintStatisticsService complaintStatisticsServiceService;

    public List<AllUserStatisticsResponseDto> getAllUser(){
        List<User> users = userRepository.findByRole(Role.USER);
        return users.stream().map(
                user -> AllUserStatisticsResponseDto.builder()
                        .id(user.getId())
                        .userName(user.getUserName())
                        .userEmail(user.getEmail())
                        .userPhoneNum(user.getPhoneNum())
                        .status(user.getStatus())
                        .recentLogin(user.getModifiedAt())
                        .createdAt(user.getCreatedAt())
                        .build()
        ).toList();
    }

    public UserStatisticsResponseDto getStatistics(String theme) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime prevStart;
        LocalDateTime prevEnd;

        // 테마별 기간 계산
        switch (theme) {
            case "week" -> {
                start = now.minusWeeks(1);
                prevStart = now.minusWeeks(2);
                prevEnd = now.minusWeeks(1);
            }
            case "month" -> {
                start = now.minusMonths(1);
                prevStart = now.minusMonths(2);
                prevEnd = now.minusMonths(1);
            }
            case "quarter" -> {
                start = now.minusMonths(3);
                prevStart = now.minusMonths(6);
                prevEnd = now.minusMonths(3);
            }
            case "year" -> {
                start = now.minusYears(1);
                prevStart = now.minusYears(2);
                prevEnd = now.minusYears(1);
            }
            default -> throw new BusinessLogicException(UNKNOW_THEME);
        }

        // 전체 회원 수
        long totalUsers = userRepository.count();

        // 현재 기간 활성 회원 수
        long activeUsers = userRepository.countByStatusAndCreatedAtBetween(Status.ACTIVE, start, now);

        // 현재 기간 신규 가입자 수
        long newUsers = userRepository.countByCreatedAtBetween(start, now);

        // 이전 기간 대비 증가율
        long prevActiveUsers = userRepository.countByStatusAndCreatedAtBetween(Status.ACTIVE, prevStart, prevEnd);
        long prevNewUsers = userRepository.countByCreatedAtBetween(prevStart, prevEnd);

        double activeUserGrowthRate = calculateGrowthRate(activeUsers, prevActiveUsers);
        double newUserGrowthRate = calculateGrowthRate(newUsers, prevNewUsers);

        // 민원 처리율 (예: 0~100%)
        double complaintRate = complaintStatisticsServiceService.getComplaintRate();

        return UserStatisticsResponseDto.builder()
                .totalUsers(totalUsers)
                .activeUserGrowthRate(activeUserGrowthRate)
                .activeUsers(activeUsers)
                .complaintRate(complaintRate)
                .newUserGrowthRate(newUserGrowthRate)
                .newUsers(newUsers)
                .build();
    }

    private double calculateGrowthRate(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100;
    }


}
