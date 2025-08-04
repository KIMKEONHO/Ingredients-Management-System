package com.example.ingredients_ms.global.jwt;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final HttpServletResponse httpServletResponse;

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
}
