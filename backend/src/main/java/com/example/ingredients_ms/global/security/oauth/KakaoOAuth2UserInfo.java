package com.example.ingredients_ms.global.security.oauth;

import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

public class KakaoOAuth2UserInfo extends OAuth2UserInfo{

    @Value("${custom.default.profile-url}")
    private String defaultProfileUrl;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getNickname() { // 닉네임 추출
        Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
        return properties != null ? (String) properties.get("nickname") : null;
    }

    @Override
    public String getEmail() { // 이메일 추출
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        return kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
    }

    @Override
    public String getProfileImageUrl() {
        // 1. properties.profile_image 먼저 확인
        Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
        if (properties != null && properties.get("profile_image") != null) {
            return (String) properties.get("profile_image");
        }

        // 2. kakao_account.profile.profile_image_url 확인
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null && profile.get("profile_image_url") != null) {
                return (String) profile.get("profile_image_url");
            }
        }

        return defaultProfileUrl;
    }

}
