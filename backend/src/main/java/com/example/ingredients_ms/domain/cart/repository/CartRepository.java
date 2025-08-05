package com.example.ingredients_ms.domain.cart.repository;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Cart findByUserId(long userId);
}
