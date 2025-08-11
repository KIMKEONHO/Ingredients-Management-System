package com.example.ingredients_ms.global.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        log.info("resolve(HttpServletRequest) called: URI={}", request.getRequestURI());
        OAuth2AuthorizationRequest authorizationRequest = defaultResolver.resolve(request);
        return customizeAuthorizationRequest(authorizationRequest, request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        log.info("resolve(HttpServletRequest, String) called: URI={}, clientRegistrationId={}", request.getRequestURI(), clientRegistrationId);
        OAuth2AuthorizationRequest authorizationRequest = defaultResolver.resolve(request, clientRegistrationId);
        return customizeAuthorizationRequest(authorizationRequest, request);
    }

    private OAuth2AuthorizationRequest customizeAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request) {

        log.info(request.getMethod() + " " + request.getRequestURI());

        if (authorizationRequest == null || request == null) {
            return null;
        }

        String redirectUrl = request.getParameter("redirectUrl");
        Map<String, Object> additionalParameters = new HashMap<>(authorizationRequest.getAdditionalParameters());

        if (redirectUrl != null && !redirectUrl.isEmpty()) {
            additionalParameters.put("redirectUrl", redirectUrl); // 추가 파라미터로만 넣음
        }

        String state = redirectUrl != null && !redirectUrl.isEmpty() ? redirectUrl : authorizationRequest.getState();

        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .additionalParameters(additionalParameters)
                .state(state)  // 여기서 state에 redirectUrl 넣기
                .build();
    }
}
