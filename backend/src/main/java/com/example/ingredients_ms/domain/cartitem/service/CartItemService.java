package com.example.ingredients_ms.domain.cartitem.service;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.cart.service.CartService;
import com.example.ingredients_ms.domain.cartitem.dto.request.CreateCartItemRequestDto;
import com.example.ingredients_ms.domain.cartitem.dto.request.UpdateCartItemRequestDto;
import com.example.ingredients_ms.domain.cartitem.dto.response.AllCartItemsResponseDto;
import com.example.ingredients_ms.domain.cartitem.dto.response.CreateCartItemResponseDto;
import com.example.ingredients_ms.domain.cartitem.dto.response.UpdateCartItemResponseDto;
import com.example.ingredients_ms.domain.cartitem.entity.CartItem;
import com.example.ingredients_ms.domain.cartitem.repository.CartItemRepository;
import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import com.example.ingredients_ms.domain.exeption.ExceptionCode;
import com.example.ingredients_ms.domain.ingredients.entity.Ingredients;
import com.example.ingredients_ms.domain.ingredients.service.IngredientsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final IngredientsService ingredientsService;
    private final CartService cartService;

    @Transactional
    public CreateCartItemResponseDto createCartItem(CreateCartItemRequestDto requestDto, long userId) {

        // 식재료 찾기
        Ingredients ingredients = ingredientsService.findById(requestDto.getIngredientId());

        CartItem cartItem = CartItem.builder()
                .ingredient(ingredients)
                .cart(getCartByUserId(userId))
                .cost(requestDto.getCost())
                .count(requestDto.getCount())
                .build();

        cartItemRepository.save(cartItem);

        // 반환 dto 만들기
        return CreateCartItemResponseDto.builder()
                .ingredientName(ingredients.getName())
                .count(cartItem.getCount())
                .build();
    }

    public List<AllCartItemsResponseDto> getAllItems(Long userId){

        List<CartItem> items = cartItemRepository.findAllByCartId(getCartByUserId(userId).getId());

        return items.stream()
                .map(item->AllCartItemsResponseDto.builder()
                        .name(item.getIngredient().getName())
                        .count(item.getCount())
                        .cost(item.getCost())
                        .build())
                .toList();
    }


    public Cart getCartByUserId(Long userId){
        return cartService.findByUserId(userId);
    }

    public void deleteItem(long ItemId, long userId){

        // 주인 이라면 삭제
        if(validateCartItem(ItemId, userId)){
            cartItemRepository.deleteById(ItemId);
        }else{
            throw new BusinessLogicException(ExceptionCode.NOT_OWNER);
        }

    }

    // 아이템 주인이 맞으면 true, 틀리면 false
    public boolean validateCartItem(long ItemId, long userId){
        // 아이템 찾기
        Optional<CartItem> opItem = cartItemRepository.findById(ItemId);
        if(opItem.isPresent()){
            CartItem cartItem = opItem.get();
            if(cartItem.getCart().getUser().getId() == userId){
                return true;
            }
        }
        return false;
    }

    public UpdateCartItemResponseDto updateItem(long itemId, UpdateCartItemRequestDto updateCartItemRequestDto, long userId){

        if(validateCartItem(itemId, userId)){
            CartItem cartItem = cartItemRepository.findById(itemId).get();
            cartItem.setCount(updateCartItemRequestDto.getCount());
            cartItem.setCost(updateCartItemRequestDto.getPrice());
            cartItemRepository.save(cartItem);
        }else{
            throw new BusinessLogicException(ExceptionCode.NOT_OWNER);
        }

        return UpdateCartItemResponseDto.builder()
                .cost(updateCartItemRequestDto.getPrice())
                .count(updateCartItemRequestDto.getCount())
                .build();
    }
}
