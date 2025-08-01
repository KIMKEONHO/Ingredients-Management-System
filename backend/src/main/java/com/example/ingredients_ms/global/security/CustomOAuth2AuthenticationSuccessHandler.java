package com.example.ingredients_ms.global.security;

import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import com.example.ingredients_ms.domain.exeption.ExceptionCode;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.jwt.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final TokenService tokenService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        String requestUri = request.getRequestURI();

        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();

        // DB에서 최신 유저 정보 가져오기
        User user = userRepository.findById(securityUser.getId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        // 쿠키로 전달
        tokenService.makeAuthCookies(user, response);

        // 리다이렉트
        String redirectUrl = request.getParameter("state");

        response.sendRedirect(redirectUrl);
    }

}
