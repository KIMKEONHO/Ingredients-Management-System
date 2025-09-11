package com.example.ingredients_ms.domain.user.repository;

import com.example.ingredients_ms.domain.user.entity.Role;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRefreshToken(String refreshToken);
    Optional<User> findBySocialIdAndSsoProvider(String socialId, String socialProvider);
    Optional<User> findByPhoneNumAndUserName(String phoneNum, String userName);
    List<User> findByRole(Role role);
    // 전체 회원 수
    long count();

    // 활성 회원 수
    long countByStatus(Status status);

    // 기간 내 신규 가입자 수
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 기간 내 활성 회원 수
    long countByStatusAndCreatedAtBetween(Status status, LocalDateTime start, LocalDateTime end);
}
