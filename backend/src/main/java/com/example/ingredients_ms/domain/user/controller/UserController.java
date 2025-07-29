package com.example.ingredients_ms.domain.user.controller;

import com.example.ingredients_ms.domain.user.dto.request.CreateUserRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.LoginRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.WithdrawRequestDto;
import com.example.ingredients_ms.domain.user.dto.response.CreateUserResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.WithdrawResponseDto;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "유저 관리 API")
public class UserController {
    private final UserService userService;
    private final JwtProvider jwtProvider;

    @PostMapping("/signup")
    @Operation(summary = "유저 생성", description = "유저를 생성하는 로직")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequestDto userRequestDto) {

        CreateUserResponseDto response = userService.createUser(userRequestDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "로그인 하는 로직")
    public ResponseEntity<?> login(LoginRequestDto loginRequestDto) {

        User responseDto = userService.login(loginRequestDto);

        String token = jwtProvider.genAccessToken(responseDto);

        return new ResponseEntity<>(token, HttpStatus.OK);
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<?> withdraw(WithdrawRequestDto withdrawRequestDto) {

        WithdrawResponseDto response = userService.withdraw(withdrawRequestDto);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
