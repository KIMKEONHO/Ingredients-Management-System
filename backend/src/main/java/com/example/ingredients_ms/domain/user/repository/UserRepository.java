package com.example.ingredients_ms.domain.user.repository;

import com.example.ingredients_ms.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    Optional<User> findByRefreshToken(String refreshToken);
}
