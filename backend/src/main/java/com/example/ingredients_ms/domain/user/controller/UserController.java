package com.example.ingredients_ms.domain.user.controller;

import com.example.ingredients_ms.domain.user.dto.request.CreateUserRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.LoginRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.WithdrawRequestDto;
import com.example.ingredients_ms.domain.user.dto.response.CreateUserResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.WithdrawResponseDto;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.jwt.JwtProvider;
import com.example.ingredients_ms.global.jwt.TokenService;
import com.example.ingredients_ms.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "유저 관리 API")
@Slf4j
public class UserController {
    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final TokenService tokenService;

    @PostMapping("/signup")
    @Operation(summary = "유저 생성", description = "유저를 생성하는 로직")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequestDto userRequestDto) {

        CreateUserResponseDto response = userService.createUser(userRequestDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "로그인 하는 로직")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequestDto, HttpServletResponse response) {

        // 1. 인증 처리
        User user = userService.login(loginRequestDto);

        // 2. Access/Refresh Token 발급 + 쿠키 설정 (TokenService 사용)
        String accessToken = tokenService.makeAuthCookies(user, response);

        // 3. 응답
        return ResponseEntity.ok().body(accessToken);
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<?> withdraw(WithdrawRequestDto withdrawRequestDto) {

        WithdrawResponseDto response = userService.withdraw(withdrawRequestDto);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

//    @GetMapping("/me")
//    public ResponseEntity<?> me (HttpServletRequest req) {
//        Cookie[] cookies = req.getCookies();
//        String accessToken = "";
//
//        for  (Cookie cookie : cookies) {
//            if(cookie.getName().equals("accessToken")) {
//                accessToken = cookie.getValue();
//            }
//        }
//
//        Map<String, Object> claims = jwtProvider.getClaims(accessToken);
//
//        String userEmail = (String) claims.get("email");
//
//        User user = userService.getUserByEmail(userEmail);
//
//        return new ResponseEntity<>(user, HttpStatus.OK);
//    }

    @GetMapping("/logout")
    public RsData<?> logout(HttpServletResponse res) {

        Cookie cookie = new Cookie("accessToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        res.addCookie(cookie);

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        res.addCookie(refreshCookie);

        return new RsData<>("200", "로그아웃에 성공하였습니다.");
    }

}
