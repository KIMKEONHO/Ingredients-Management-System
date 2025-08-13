package com.example.ingredients_ms.domain.user.service;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.email.service.EmailService;
import com.example.ingredients_ms.domain.user.dto.request.CreateUserRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.ExchangePWRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.FindIdRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.LoginRequestDto;
import com.example.ingredients_ms.domain.user.dto.response.CreateUserResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.FindIdResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.ValidUserResponseDto;
import com.example.ingredients_ms.domain.user.entity.Role;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.Status;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import com.example.ingredients_ms.global.jwt.JwtProvider;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.SecurityUser;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final EmailService emailService;

    @Transactional
    public CreateUserResponseDto createUser(CreateUserRequestDto createUserRequestDto) {

        Optional<User> checkedSignUpUser = userRepository.findByEmail(createUserRequestDto.getEmail());

        // 기존에 존재하는 유저인지 체크
        if (checkedSignUpUser.isPresent()) {
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
                .role(Role.USER)
                .build();

        // 카트 생성 후 설정
        Cart cart = Cart.builder()
                .user(user)
                .build();

        user.setCart(cart);

        User savedUser = userRepository.save(user);

        return CreateUserResponseDto.builder()
                .Name(savedUser.getUserName())
                .Email(savedUser.getEmail())
                .build();
    }

    @Transactional
    public User login(LoginRequestDto loginRequestDto) {

        Optional<User> opUser = userRepository.findByEmail(loginRequestDto.getEmail());

        // USER가 있는 USER인지
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        // 활동 가능한 상태인지
        if(user.getStatus() != Status.ACTIVE){
            throw new BusinessLogicException(ExceptionCode.NOT_ACTIVE);
        }

        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword())) {
            throw new BusinessLogicException(ExceptionCode.INCORRECT_PASSWORD);
        }

        return user;
    }

    public void withdraw(String email) {

        Optional<User> opUser = userRepository.findByEmail(email);
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }
        User user = opUser.get();
        if(user.getStatus() != Status.ACTIVE){
            throw new BusinessLogicException(ExceptionCode.NOT_ACTIVE);
        }
        user.setStatus(Status.INACTIVE);
        userRepository.save(user);

    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public ValidUserResponseDto getUserByEmailToDto(String email){

        Optional<User> user = userRepository.findByEmail(email);
        if(user.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        ValidUserResponseDto validUserResponseDto = ValidUserResponseDto.builder()
                .email(user.get().getEmail())
                .name(user.get().getUserName())
                .build();

        return validUserResponseDto;
    }



    // 토큰 유효성 검증
    public boolean validationToken(String token) {
        return jwtProvider.verify(token);
    }

    // 토큰 갱신
    public RsData<String> refreshAccessToken(String refreshToken) {
        log.info("Refresh Token: " + refreshToken);
        User user = userRepository.findByRefreshToken(refreshToken).orElseThrow(() -> new BusinessLogicException(ExceptionCode.INVALID_TOKEN));

        String accessToken = jwtProvider.genAccessToken(user);

        return new RsData<>("200", "토큰 갱신에 성공하였습니다.", accessToken);
    }

    public SecurityUser getUserFromAccessToken(String accessToken){
        Map<String, Object> payloadBody = jwtProvider.getClaims(accessToken);

        long id = Long.parseLong(payloadBody.get("id").toString());
        String username = payloadBody.get("username").toString();
        String email = payloadBody.get("email").toString();
        String role = payloadBody.get("role").toString(); // "ADMIN"

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + role) // Spring Security 표준 prefix
        );

        return new SecurityUser(id, email, username, "", authorities);
    }

    public Optional<User> findBySocialIdAndSsoProvider(String socialId, String socialProvider){
        return userRepository.findBySocialIdAndSsoProvider(socialId,socialProvider);
    }

    public void modify(User user, @NotBlank String username){
        user.setUserName(username);
    }

    @Transactional
    public User modifyOrJoins(String email, String username, String provider, String socialId){
       Optional<User> opUser = userRepository.findByEmail(email);
       log.info("user email : {}", email);

        if(opUser.isPresent()){
            User user = opUser.get();
            modify(user,username);
            return user;
        }

        return createSocialUser(email, "",username,provider,socialId);
    }

    public User createSocialUser(String email, String password, String username,String provider,String socialId){

        User user = User.builder()
                .email(email)
                .password(password)
                .userName(username)
                .phoneNum(" ")
                .ssoProvider(provider)
                .role(Role.USER)
                .socialId(socialId)
                .createdAt(LocalDateTime.now())
                .modifiedAt(LocalDateTime.now())
                .build();

        Cart cart = Cart.builder()
                .user(user)
                .build();

        user.setCart(cart);

        return userRepository.save(user);
    }

    public FindIdResponseDto findId(FindIdRequestDto requestDto){

        Optional<User> user = userRepository.findByPhoneNumAndUserName(requestDto.getPhone(), requestDto.getName());

        if(user.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        return FindIdResponseDto.builder()
                .id(user.get().getId())
                .email(user.get().getEmail())
                .build();
    }

    public void findPw(String email){
        Optional<User> opUser = userRepository.findByEmail(email);

        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        String tempPassword = generateTempPassword();

        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        emailService.sendTempPasswordEmail(user.getEmail(), tempPassword);
    }

    // 새로운 패스워드 생성
    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public void changePassword(String email, ExchangePWRequestDto requestDto){

        Optional<User> opUser = userRepository.findByEmail(email);
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        user.setPassword(passwordEncoder.encode(requestDto.getPassword()));

        userRepository.save(user);

    }
}
