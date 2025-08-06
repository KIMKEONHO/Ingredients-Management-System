package com.example.ingredients_ms.global.jwt;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final HttpServletResponse httpServletResponse;
    private final HttpServletRequest httpServletRequest;


    public String makeAuthCookies(User user, HttpServletResponse response) {
        String accessToken = jwtProvider.genAccessToken(user);
        String refreshToken = jwtProvider.genRefreshToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        setCookie(response, "accessToken", accessToken);
        setCookie(response, "refreshToken", refreshToken); // refreshToken도 함께
        return accessToken;
    }

    public void setCookie(HttpServletResponse response, String name, String value) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(3600)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public Long getIdFromToken() {
        String token = getTokenFromRequest();

        if (token == null) {
            throw new IllegalArgumentException("Token is missing");
        }

        if (!jwtProvider.verify(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        Map<String, Object> claims = jwtProvider.getClaims(token);

        return Long.valueOf(String.valueOf(claims.get("id")));
    }

    public String getRoleFromToken() {
        String token = getTokenFromRequest();

        if (token == null) {
            throw new IllegalArgumentException("Token is missing");
        }

        if (!jwtProvider.verify(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        Map<String, Object> claims = jwtProvider.getClaims(token);

        return String.valueOf(claims.get("role"));
    }

    private String getTokenFromRequest() {
        String authorization = httpServletRequest.getHeader("Authorization");
        if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
            return authorization.substring(7); // "Bearer " 뒤의 토큰 값 추출
        }

        //쿠키에 있는지 확인
        Cookie[] cookies = httpServletRequest.getCookies();
        if(cookies!=null){
            for(Cookie cookie : cookies){
                if("accessToken".equals(cookie.getName())){
                    return cookie.getValue();
                }
            }
        }

        return null;


    }
}
