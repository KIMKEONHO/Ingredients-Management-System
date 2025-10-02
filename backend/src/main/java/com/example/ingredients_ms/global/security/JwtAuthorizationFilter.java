package com.example.ingredients_ms.global.security;

import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.rsdata.RsData;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthorizationFilter extends OncePerRequestFilter {
    private final HttpServletRequest req;
    private final HttpServletResponse resp;
    private final UserService userService;
    @Override
    @SneakyThrows
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
        if (List.of(
                "/api/v1/users/login",
                "/api/v1/users/logout",
                "/api/v1/users/signup",
                "/api/v1/email/send",
                "/api/v1/email/verify",
                "/api/v1/users/findPW",
                "/api/v1/users/findID"
        ).contains(request.getRequestURI()) ) {
            filterChain.doFilter(request, response);
            return;
        }
        String accessToken = _getCookie("accessToken");
        // accessToken 검증 or refreshToken 발급
        if (!accessToken.isBlank()) {
            // 토큰 유효기간 검증
            if (!userService.validationToken(accessToken)) {
                String refreshToken = _getCookie("refreshToken");
                RsData<String> rs = userService.refreshAccessToken(refreshToken);
                _addHeaderCookie("accessToken", rs.getData());
            }
            // securityUser 가져오기
            SecurityUser securityUser = userService.getUserFromAccessToken(accessToken);
            // 인가 처리
            SecurityContextHolder.getContext().setAuthentication(securityUser.getAuthentication());
        }
        filterChain.doFilter(request, response);
    }
    private String _getCookie(String name) {
        Cookie[] cookies = req.getCookies();

        if (cookies == null) return "";

        return Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals(name))
                .findFirst()
                .map(Cookie::getValue)
                .orElse("");
    }
    private void _addHeaderCookie(String tokenName, String token) {
        ResponseCookie cookie = ResponseCookie.from(tokenName, token)
                .path("/")
                .sameSite("None")
                .secure(true)
                .httpOnly(true)
                .build();
        resp.addHeader("Set-Cookie", cookie.toString());
    }
}