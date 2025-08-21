package com.example.ingredients_ms.global.security;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.security.oauth.OAuth2UserInfo;
import com.example.ingredients_ms.global.security.oauth.OAuth2UserInfoFactory;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    // 소셜 로그인이 성공할 때마다 이 함수가 실행된다.
    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
//        String oauthId = oAuth2User.getName();
        String providerTypeCode = userRequest
                .getClientRegistration()
                .getRegistrationId()
                .toUpperCase(Locale.getDefault());
//        Map<String, Object> attributes = oAuth2User.getAttributes();
//        Map<String, String> attributesProperties = (Map<String, String>) attributes.get("properties");
//        String nickname = attributesProperties.get("nickname");
//        // 프로필 이미지 필요시
////        String profileImgUrl = attributesProperties.get("profile_image");
//        String email = providerTypeCode + "__" + oauthId;

        // 소셜 유저 정보 공통 인터페이스에 구분되어 구현된 전용 객체 할당
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory
                .getOAuth2UserInfo(providerTypeCode, oAuth2User.getAttributes());

        String oauthId = userInfo.getId();
        String email = userInfo.getEmail();
        if (email == null) {
            // 이메일 없는 Provider(Kakao) 대응
            email = providerTypeCode + "__" + oauthId;
        }


        Optional<User> validUser = userService.findBySocialIdAndSsoProvider(oauthId,providerTypeCode);

        User user;
//        user = validUser.orElseGet(() -> userService.modifyOrJoins(email, nickname, providerTypeCode, oauthId));
        String finalEmail = email;
        user = validUser.orElseGet(() -> userService.modifyOrJoins(finalEmail, userInfo.getNickname(), providerTypeCode, oauthId));

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getUserName(),
                "",
                user.getAuthorities(),
//                attributes
                oAuth2User.getAttributes()
        );
    }

}