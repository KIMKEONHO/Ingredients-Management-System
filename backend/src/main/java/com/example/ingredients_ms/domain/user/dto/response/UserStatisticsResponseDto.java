package com.example.ingredients_ms.domain.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserStatisticsResponseDto {

    private long totalUsers;             // 총 회원 수
    private long activeUsers;            // 활성 회원 수
    private long newUsers;               // 신규 가입자 수
    private double activeUserGrowthRate; // 활성 회원 증가율 %
    private double newUserGrowthRate;    // 신규 가입자 증가율 %
    private double complaintRate;        // 민원 처리율 (%)

}
