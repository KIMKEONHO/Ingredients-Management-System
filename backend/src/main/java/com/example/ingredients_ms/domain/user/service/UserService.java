package com.example.ingredients_ms.domain.user.service;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.exeption.BusinessLogicException;
import com.example.ingredients_ms.domain.exeption.ExceptionCode;
import com.example.ingredients_ms.domain.user.dto.request.CreateUserRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.LoginRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.WithdrawRequestDto;
import com.example.ingredients_ms.domain.user.dto.response.CreateUserResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.WithdrawResponseDto;
import com.example.ingredients_ms.domain.user.entity.Role;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.Status;
import com.example.ingredients_ms.global.jwt.JwtProvider;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.SecurityUser;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public CreateUserResponseDto createUser(CreateUserRequestDto createUserRequestDto) {

        User checkedSignUpUser = userRepository.findByEmail(createUserRequestDto.getEmail());

        // 기존에 존재하는 유저인지 체크
        if (checkedSignUpUser != null) {
            throw new BusinessLogicException(ExceptionCode.ALREADY_USER);
        }

        // 입력 받은 정보 저장
        User user = User.builder()
                .userName(createUserRequestDto.getName())
                .phoneNum(createUserRequestDto.getPhoneNumber())
                .nickname(createUserRequestDto.getNickName())
                .email(createUserRequestDto.getEmail())
                .password(passwordEncoder.encode(createUserRequestDto.getPassword()))
                .status(Status.ACTIVE)
                .roles(Set.of(Role.USER))
                .build();

        // 카트 생성 후 설정
        Cart cart = Cart.builder()
                .user(user)
                .build();

        user.setCart(cart);

        // RefreshToken 생성
        String refreshToken = jwtProvider.genRefreshToken(user);
        user.setRefreshToken(refreshToken);

        log.info("refreshToken: {}", refreshToken);

        User savedUser = userRepository.save(user);

        return CreateUserResponseDto.builder()
                .Name(savedUser.getUserName())
                .Email(savedUser.getEmail())
                .build();
    }

    @Transactional
    public User login(LoginRequestDto loginRequestDto) {

        User user = userRepository.findByEmail(loginRequestDto.getEmail());

        // USER가 있는 USER인지
        if(user == null){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        // 활동 가능한 상태인지
        if(user.getStatus() != Status.ACTIVE){
            throw new BusinessLogicException(ExceptionCode.NOT_ACTIVE);
        }

        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword())) {
            throw new BusinessLogicException(ExceptionCode.INCORRECT_PASSWORD);
        }

        return user;
    }

    public WithdrawResponseDto withdraw(WithdrawRequestDto withdrawRequestDto) {

        return null;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    // 토큰 유효성 검증
    public boolean validationToken(String token) {
        return jwtProvider.verify(token);
    }

    // 토큰 갱신
    public RsData<String> refreshAccessToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken).orElseThrow(() -> new BusinessLogicException(ExceptionCode.INVALID_TOKEN));

        String accessToken = jwtProvider.genAccessToken(user);

        return new RsData<>("200", "토큰 갱신에 성공하였습니다.", accessToken);
    }

    public SecurityUser getUserFromAccessToken(String accessToken){
        Map<String, Object> payloadBody = jwtProvider.getClaims(accessToken);
        long id = (int)payloadBody.get("id");
        String username = payloadBody.get("username").toString();
        String email = (String) payloadBody.get("email");
        List<GrantedAuthority> authorities = new ArrayList<>();
        return new SecurityUser(id,email,"",authorities);
    }

    public Optional<User> findBySocialIdAndSsoProvider(String socialId, String socialProvider){
        return userRepository.findBySocialIdAndSsoProvider(socialId,socialProvider);
    }
}
