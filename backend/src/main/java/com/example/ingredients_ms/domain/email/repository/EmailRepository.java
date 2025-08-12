package com.example.ingredients_ms.domain.email.repository;

import com.example.ingredients_ms.domain.email.entity.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {
}
