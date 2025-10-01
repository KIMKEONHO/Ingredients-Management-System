package com.example.ingredients_ms.domain.user.controller;

import com.example.ingredients_ms.domain.user.dto.request.*;
import com.example.ingredients_ms.domain.user.dto.response.CreateUserResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.FindIdResponseDto;
import com.example.ingredients_ms.domain.user.dto.response.ProfileReposeDto;
import com.example.ingredients_ms.domain.user.dto.response.ValidUserResponseDto;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.service.UserService;
import com.example.ingredients_ms.global.jwt.JwtProvider;
import com.example.ingredients_ms.global.jwt.TokenService;
import com.example.ingredients_ms.domain.useractivity.service.UserActivityService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "유저 관리 API")
@Slf4j
public class UserController {
    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final TokenService tokenService;
    private final UserActivityService userActivityService;

    @PostMapping("/signup")
    @Operation(summary = "유저 생성", description = "유저를 생성하는 로직")
    public RsData<?> createUser(@Valid @RequestBody CreateUserRequestDto userRequestDto) {

        CreateUserResponseDto response = userService.createUser(userRequestDto);

        return new RsData<>("201", "유저를 생성하였습니다.", response);
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "로그인 하는 로직")
    public RsData<?> login(@RequestBody LoginRequestDto loginRequestDto, HttpServletResponse response) {

        // 1. 인증 처리
        User user = userService.login(loginRequestDto);

        // 2. 로그인 활동 로그 기록
        userActivityService.logLogin(user);

        // 3. Access/Refresh Token 발급 + 쿠키 설정 (TokenService 사용)
        String accessToken = tokenService.makeAuthCookies(user, response);

        // 4. 응답
        return new RsData<>("200", "로그인하였습니다.", accessToken);
    }

    @GetMapping("/findID")
    public RsData<?> findID(@RequestParam String phoneNum, @RequestParam String name) {

        FindIdResponseDto response = userService.findId(phoneNum, name);

        return new RsData<>("200", "ID를 찾았습니다.", response);
    }

    @PostMapping("/findPW")
    public RsData<?> findPW(@RequestBody FindPwRequestDto requestDto){

        userService.findPw(requestDto.getEmail());

        return new RsData<>("201","임시 비빌번호를 메일로 전송하였습니다.");
    }

    @DeleteMapping("/withdraw")
    public RsData<?> withdraw(@CurrentUser SecurityUser currentUser) {

        userService.withdraw(currentUser.getEmail());

        return new RsData<>("204", "회원이 탈퇴되었습니다.");
    }

    @GetMapping("/me")
    public RsData<?> me (HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        String accessToken = "";

        for  (Cookie cookie : cookies) {
            if(cookie.getName().equals("accessToken")) {
                accessToken = cookie.getValue();
            }
        }

        Map<String, Object> claims = jwtProvider.getClaims(accessToken);

        String userEmail = (String) claims.get("email");

        ValidUserResponseDto responseDto = userService.getUserByEmailToDto(userEmail);

        return new RsData<>("200","회원 인증에 성공하였습니다.", responseDto);
    }

    @PostMapping("/logout")
    public RsData<?> logout(HttpServletResponse res) {

        Cookie cookie = new Cookie("accessToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        res.addCookie(cookie);

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        res.addCookie(refreshCookie);

        return new RsData<>("201", "로그아웃에 성공하였습니다.");
    }

    @PostMapping("/exchange/password")
    public RsData<?> exchangePassword(
            @CurrentUser SecurityUser currentUser,
            @RequestBody ExchangePWRequestDto requestDto
    ){

        userService.changePassword(currentUser.getEmail(), requestDto.getPassword());

        return new RsData<>("204", "비밀번호가 변경되었습니다.");
    }

    @PostMapping("/exchange/nickname")
    public RsData<?> exchangeNickname(
            @CurrentUser SecurityUser currentUser,
            @RequestBody ExchangeNickNameRequestDto requestDto
    ){
        userService.changeNickName(currentUser.getEmail(), requestDto.getNickname());
        return new RsData<>("204", "닉네임이 변경되었습니다.");
    }

    @PostMapping("/exchange/phone")
    public RsData<?> exchangePhone(
            @CurrentUser SecurityUser currentUser,
            @RequestBody ExchangePhoneNumRequestDto requestDto
    ){

        userService.changePhoneNum(currentUser.getEmail(), requestDto.getPhoneNum()) ;

        return new RsData<>("204","핸드폰 번호가 변경되었습니다.");
    }

    @PostMapping("/exchange/profile")
    @Operation(summary = "프로필 이미지 변경", description = "사용자의 프로필 이미지를 변경합니다")
    public RsData<?> exchangeProfile(
            @CurrentUser SecurityUser currentUser,
            @RequestParam("profileImage") MultipartFile profileImage
    ) {
        userService.changeProfileImage(currentUser.getEmail(), profileImage);
        return new RsData<>("204", "프로필 이미지가 변경되었습니다.");
    }

    @PostMapping("/admin/login")
    public RsData<?> adminLogin(@RequestBody LoginRequestDto loginRequestDto, HttpServletResponse response) {

        User user = userService.adminLogin(loginRequestDto);

        // 관리자 로그인 활동 로그 기록
        userActivityService.logLogin(user);

        String accessToken = tokenService.makeAuthCookies(user, response);

        return new RsData<>("200", "로그인하였습니다.", accessToken);
    }

    @PostMapping("/profile")
    public RsData<?> getProfile(@CurrentUser SecurityUser currentUser){

        ProfileReposeDto response = userService.getProfile(currentUser.getId());

        return new RsData<>("200","정보를 찾았습니다.", response);
    }

    @PostMapping("/change/status")
    public RsData<?> changeStatus(@RequestBody ChangeStatusRequestDto request){

        userService.changeStatus(request);

        return new RsData<>("201", "상태를 변경하였습니다.");
    }

    @DeleteMapping("/drop/{userId}")
    public RsData<?> dropUser(@PathVariable Long userId){

        userService.dropUser(userId);

        return new RsData<>("204","유저를 삭제했습니다.");
    }

    @PatchMapping("/change/userdata")
    public RsData<?> changeUser(@RequestBody ChangeUserDataRequestDto requestDto){

        userService.changeUserData(requestDto);

        return new RsData<>("201","유저를 업데이트하였습니다");
    }

    @PostMapping("/exchange/profile-data")
    public RsData<?> exchangeProfileData(
            @CurrentUser SecurityUser currentUser,
            @RequestBody ExchangeProfileDataRequestDto requestDto
    ){
        return userService.changeProfileData(currentUser.getId(), requestDto);
    }

}
