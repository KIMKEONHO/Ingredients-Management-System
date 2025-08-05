package com.example.ingredients_ms.domain.cart.service;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.cart.repository.CartRepository;
import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.example.ingredients_ms.domain.exeption.ExceptionCode.CART_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartItemRepository;

    public Cart findByUserId(long userId) {

        Cart cart = cartItemRepository.findByUserId(userId);
        if (cart == null) {
            throw new BusinessLogicException(CART_NOT_FOUND);
        }
        return cartItemRepository.findByUserId(userId);
    }
}
