package com.example.ingredients_ms.domain.user.repository;

import com.example.ingredients_ms.domain.user.entity.Role;
import com.example.ingredients_ms.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRefreshToken(String refreshToken);
    Optional<User> findBySocialIdAndSsoProvider(String socialId, String socialProvider);
    Optional<User> findByPhoneNumAndUserName(String phoneNum, String userName);
    List<User> findByRole(Role role);
}
