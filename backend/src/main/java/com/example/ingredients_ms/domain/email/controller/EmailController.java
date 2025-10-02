package com.example.ingredients_ms.domain.email.controller;

import com.example.ingredients_ms.domain.email.dto.EmailDto;
import com.example.ingredients_ms.domain.email.service.EmailService;
import com.example.ingredients_ms.global.rsdata.RsData;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/email")
@Slf4j
public class EmailController {
    private final EmailService emailService;

    // 인증코드 메일 발송
    @PostMapping("/send")
    public RsData<?> mailSend(@RequestBody EmailDto emailDto) throws MessagingException {
        log.info("email : {}", emailDto.getMail());
        emailService.sendEmail(emailDto.getMail());
        return new RsData<>("201","인증 메일이 발송되었습니다.");
    }

    // 인증코드 인증
    @PostMapping("/verify")
    public RsData<?> verify(@RequestBody EmailDto emailDto) {
        emailService.verifyEmailCode(emailDto.getMail(), emailDto.getVerifyCode());
        return new RsData<>("201", "인증되었습니다.");
    }
}