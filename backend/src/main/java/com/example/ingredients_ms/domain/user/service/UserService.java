package com.example.ingredients_ms.domain.user.service;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import com.example.ingredients_ms.domain.exeption.ExceptionCode;
import com.example.ingredients_ms.domain.user.dto.request.CreateUserRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.LoginRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.WithdrawRequestDto;
import com.example.ingredients_ms.domain.user.dto.response.CreateUserResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.LoginResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.WithdrawResponseDto;
import com.example.ingredients_ms.domain.user.entity.Role;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.Status;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    public final UserRepository userRepository;

    @Transactional
    public CreateUserResponseDto createUser(CreateUserRequestDto createUserRequestDto) {

        // 입력 받은 정보 저장
        User user = User.builder()
                .userName(createUserRequestDto.getName())
                .phoneNum(createUserRequestDto.getPhoneNumber())
                .nickname(createUserRequestDto.getNickName())
                .email(createUserRequestDto.getEmail())
                .password(createUserRequestDto.getPassword())
                .status(Status.ACTIVE)
                .roles(Set.of(Role.USER))
                .build();

        // 카트 생성 후 설정
        Cart cart = Cart.builder()
                .user(user)
                .build();

        user.setCart(cart);

        User savedUser = userRepository.save(user);

        return CreateUserResponseDto.builder()
                .Name(savedUser.getUserName())
                .Email(savedUser.getEmail())
                .build();
    }

    @Transactional
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {

        User user = userRepository.findByEmail(loginRequestDto.getEmail());

        // USER가 있는 USER인지
        if(user == null){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        // 활동 가능한 상태인지
        if(user.getStatus() != Status.ACTIVE){
            throw new BusinessLogicException(ExceptionCode.NOT_ACTIVE);
        }

        if(!user.getPassword().equals(loginRequestDto.getPassword())){
            throw new BusinessLogicException(ExceptionCode.INCORRECT_PASSWORD);
        }

        return LoginResponseDto.builder()
                .email(user.getEmail())
                .password(user.getPassword())
                .build();
    }

    public WithdrawResponseDto withdraw(WithdrawRequestDto withdrawRequestDto) {

        return null;
    }
}
