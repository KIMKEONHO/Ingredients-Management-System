package com.example.ingredients_ms.domain.user.service;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.email.service.EmailService;
import com.example.ingredients_ms.domain.image.dto.ImageUploadResponseDto;
import com.example.ingredients_ms.domain.image.exception.ImageException;
import com.example.ingredients_ms.domain.image.service.ImageFolderType;
import com.example.ingredients_ms.domain.image.service.ImageService;
import com.example.ingredients_ms.domain.user.dto.request.ChangeStatusRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.ChangeUserDataRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.CreateUserRequestDto;
import com.example.ingredients_ms.domain.user.dto.request.LoginRequestDto;
import com.example.ingredients_ms.domain.user.dto.response.CreateUserResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.FindIdResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.ProfileReposeDto;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    private final ImageService imageService;

    @Value("${custom.default.profile-url}")
    private String defaultProfileUrl;

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
                .profileUrl(defaultProfileUrl) // 디폴트 이미지로 설정
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

    @Transactional
    public User adminLogin(LoginRequestDto loginRequestDto){

        Optional<User> opUser = userRepository.findByEmail(loginRequestDto.getEmail());

        // USER가 있는 USER인지
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        if(user.getRole() != Role.ADMIN){
            throw new BusinessLogicException(ExceptionCode.NOT_ADMIN);
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
        user.setStatus(Status.WITHDRAWN);
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

        return ValidUserResponseDto.builder()
                .userId(user.get().getId())
                .email(user.get().getEmail())
                .name(user.get().getUserName())
                .profile(user.get().getProfileUrl())
                .build();
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
    public User modifyOrJoins(String email, String username, String provider, String socialId, String profileUrl){
       Optional<User> opUser = userRepository.findByEmail(email);
       log.info("user email : {}", email);

        if(opUser.isPresent()){
            User user = opUser.get();
            modify(user,username);
            return user;
        }

        return createSocialUser(email, "",username,provider,socialId, profileUrl);
    }

    public User createSocialUser(String email, String password, String username,String provider,String socialId, String profileUrl){

        User user = User.builder()
                .email(email)
                .password(password)
                .userName(username)
                .phoneNum(" ")
                .ssoProvider(provider)
                .nickname(provider+"__"+socialId)
                .role(Role.USER)
                .profileUrl(profileUrl)
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

    @Transactional
    public FindIdResponseDto findId(String phoneNum, String name){

        Optional<User> user = userRepository.findByPhoneNumAndUserName(phoneNum, name);

        if(user.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        return FindIdResponseDto.builder()
                .id(user.get().getId())
                .email(user.get().getEmail())
                .build();
    }

    @Transactional
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

    @Transactional
    public void changePassword(String email, String password){

        Optional<User> opUser = userRepository.findByEmail(email);
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);
    }

    @Transactional
    public void changeNickName(String email, String nickname){
        Optional<User> opUser = userRepository.findByEmail(email);
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        user.setNickname(nickname);

        userRepository.save(user);
    }

    public void changePhoneNum(String email, String phoneNum){
        Optional<User> opUser = userRepository.findByEmail(email);
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        user.setPhoneNum(phoneNum);

        userRepository.save(user);
    }

    @Transactional
    public ProfileReposeDto getProfile(Long userId){

        Optional<User> opUser = userRepository.findById(userId);
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        return ProfileReposeDto.builder()
                .nickName(user.getNickname())
                .phoneNum(user.getPhoneNum())
                .email(user.getEmail())
                .profile(user.getProfileUrl())
                .userStatus(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void changeStatus(ChangeStatusRequestDto requestDto){

        Optional<User> opUser = userRepository.findById(requestDto.getUserId());
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        user.setStatus(Status.fromValue(requestDto.getStatus()));

        userRepository.save(user);
    }

    public void dropUser(Long userId){

        userRepository.deleteById(userId);

    }

    public void changeUserData(ChangeUserDataRequestDto requestDto){

        Optional<User> opUser = userRepository.findById(requestDto.getUserId());
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();

        user.setUserName(requestDto.getUserName());
        user.setStatus(Status.fromValue(requestDto.getUserStatus()));
        user.setPhoneNum(requestDto.getUserPhone());
        user.setEmail(requestDto.getUserEmail());

        userRepository.save(user);

    }

    @Transactional
    public void changeProfileImage(String email, MultipartFile profileImage) {
        Optional<User> opUser = userRepository.findByEmail(email);
        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();
        String currentProfileUrl = user.getProfileUrl();

        // 기존 프로필 이미지가 기본 이미지가 아니고, 내부 S3 URL인 경우에만 삭제
        if (!currentProfileUrl.equals(defaultProfileUrl) && imageService.isInternalS3Url(currentProfileUrl)) {
            try {
                // S3 URL에서 파일 키 추출
                String s3Key = imageService.extractS3KeyFromUrl(currentProfileUrl);
                if (s3Key != null) {
                    // 기존 이미지 삭제
                    imageService.deleteImage(s3Key, ImageFolderType.PROFILE);
                }
            } catch (Exception e) {
                // 기존 이미지 삭제 실패는 로그만 남기고 계속 진행
                log.warn("기존 프로필 이미지 삭제 실패: {}", e.getMessage());
            }
        }

        try {
            // 새 이미지를 S3에 업로드
            RsData<ImageUploadResponseDto> uploadResult = imageService.uploadImage(profileImage, ImageFolderType.PROFILE);

            // 업로드된 이미지 URL로 프로필 업데이트
            user.setProfileUrl(uploadResult.getData().getImageUrl());
            userRepository.save(user);

        } catch (ImageException e) {
            throw new BusinessLogicException(ExceptionCode.IMAGE_UPLOAD_FAILED);
        }
    }

    public Optional<User> findUserById(Long userId){
        return userRepository.findById(userId);
    }
}
