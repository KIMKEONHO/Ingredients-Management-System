package com.example.ingredients_ms.domain.cartitem.controller;

import com.example.ingredients_ms.domain.cartitem.dto.request.CreateCartItemRequestDto;
import com.example.ingredients_ms.domain.cartitem.dto.request.UpdateCartItemRequestDto;
import com.example.ingredients_ms.domain.cartitem.dto.response.AllCartItemsResponseDto;
import com.example.ingredients_ms.domain.cartitem.dto.response.CreateCartItemResponseDto;
import com.example.ingredients_ms.domain.cartitem.dto.response.UpdateCartItemResponseDto;
import com.example.ingredients_ms.domain.cartitem.service.CartItemService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart/item")
@RequiredArgsConstructor
@Tag(name = "장바구니 아이템 API", description = "장바구니 아이템 관리를 위한 API")
public class CartItemController {

    private final CartItemService cartItemService;

    // 다건 조회
    @GetMapping("/")
    public RsData<?> allCartItems(@CurrentUser SecurityUser currentUser) {

        List<AllCartItemsResponseDto> responseDtos = cartItemService.getAllItems(currentUser.getId());

        return new RsData<>("200","모든 Itme을 찾았습니다.", responseDtos);
    }

    // 삭제
    @DeleteMapping("/{itemId}")
    public RsData<?> deleteById(
            @PathVariable Long itemId,
            @CurrentUser SecurityUser currentUser) {

        cartItemService.deleteItem(itemId, currentUser.getId());

        return new RsData<>("204", "아이템이 삭제되었습니다.");
    }

    @PatchMapping("{itemId}")
    public RsData<?> updateById(
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemRequestDto updateCartItemRequestDto,
            @CurrentUser SecurityUser currentUser) {

        UpdateCartItemResponseDto updateItem = cartItemService.updateItem(itemId,updateCartItemRequestDto, currentUser.getId());

        return new RsData<>("200","아이템이 수정되었습니다.", updateItem);
    }

    @PostMapping("/")
    public RsData<?> save(
            @RequestBody CreateCartItemRequestDto requestDto,
            @CurrentUser SecurityUser currentUser) {

        CreateCartItemResponseDto cartItemResponseDto = cartItemService.createCartItem(requestDto, currentUser.getId() );

        return new RsData<>("201",cartItemResponseDto.getIngredientName() + "가 추가되었습니다.", cartItemResponseDto);
    }


}
