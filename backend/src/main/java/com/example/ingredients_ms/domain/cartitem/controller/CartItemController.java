package com.example.ingredients_ms.domain.cartitem.controller;

import com.example.ingredients_ms.domain.cartitem.dto.request.CreateCartItemRequestDto;
import com.example.ingredients_ms.domain.cartitem.service.CartItemService;
import com.example.ingredients_ms.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController("/api/v1/cart/item")
@RequiredArgsConstructor
public class CartItemController {

    private final CartItemService cartItemService;

    // 다건 조회
    @GetMapping("/")
    public RsData<?> allCartItems() {

        return null;
    }

    // 단건 조회
    @GetMapping("/{id}")
    public RsData<?> findById(@PathVariable Long id) {

        return null;
    }

    // 삭제
    @DeleteMapping("/{id}")
    public RsData<?> deleteById(@PathVariable Long id) {
        return null;
    }

    @PatchMapping("{id}")
    public RsData<?> updateById(@PathVariable Long id) {
        return null;
    }

    @PostMapping("/")
    public RsData<?> save(@RequestBody CreateCartItemRequestDto requestDto) {

        cartItemService.createCartItem(requestDto);

        return null;
    }


}
