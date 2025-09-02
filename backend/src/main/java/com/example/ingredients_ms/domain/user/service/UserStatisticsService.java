package com.example.ingredients_ms.domain.user.service;

import com.example.ingredients_ms.domain.user.dto.response.AllUserStatisticsResponseDto;
import com.example.ingredients_ms.domain.user.entity.Role;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserStatisticsService {

    private final UserRepository userRepository;

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

}
