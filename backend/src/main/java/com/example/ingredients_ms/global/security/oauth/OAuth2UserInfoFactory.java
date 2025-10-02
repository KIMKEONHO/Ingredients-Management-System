package com.example.ingredients_ms.global.security.oauth;

import java.util.Map;

public class OAuth2UserInfoFactory {
    public static OAuth2UserInfo getOAuth2UserInfo(String provider, Map<String, Object> attributes) {
        switch (provider.toUpperCase()) {
            case "KAKAO":
                return new KakaoOAuth2UserInfo(attributes);
            case "GOOGLE":
                return new GoogleOAuth2UserInfo(attributes);
            default:
                throw new IllegalArgumentException("Unsupported provider: " + provider);
        }
    }
}
