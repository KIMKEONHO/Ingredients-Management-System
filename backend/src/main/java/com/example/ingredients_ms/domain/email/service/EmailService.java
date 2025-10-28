package com.example.ingredients_ms.domain.email.service;

import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.redis.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.util.Random;

import static com.example.ingredients_ms.global.exeption.ExceptionCode.NON_MATCHED;

@Slf4j
@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final RedisUtil redisUtil;

    public EmailService(JavaMailSender javaMailSender, @Autowired(required = false) RedisUtil redisUtil) {
        this.javaMailSender = javaMailSender;
        this.redisUtil = redisUtil;
    }

    @Value("${spring.mail.username}")
    private String senderEmail;

    private String createCode() {
        int leftLimit = 48; // number '0'
        int rightLimit = 122; // alphabet 'z'
        int targetStringLength = 6;
        Random random = new Random();

        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 | i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    // 이메일 내용 초기화
    private String setContext(String code) {
        Context context = new Context();
        TemplateEngine templateEngine = new TemplateEngine();
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();

        context.setVariable("code", code);

        templateResolver.setPrefix("templates/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCacheable(false);

        templateEngine.setTemplateResolver(templateResolver);

        return templateEngine.process("mail", context);
    }

    // 이메일 폼 생성
    private MimeMessage createEmailForm(String email) throws MessagingException {
        String authCode = createCode();

        MimeMessage message = javaMailSender.createMimeMessage();
        message.addRecipients(MimeMessage.RecipientType.TO, email);
        message.setSubject("안녕하세요. 인증번호입니다.");
        message.setFrom(senderEmail);
        message.setText(setContext(authCode), "utf-8", "html");

        // Redis 에 해당 인증코드 인증 시간 설정
        if (redisUtil != null) {
            redisUtil.setDataExpire(email, authCode, 60 * 30L);
        }

        return message;
    }

    // 인증코드 이메일 발송
    public void sendEmail(String toEmail) throws MessagingException {
        if (redisUtil != null && redisUtil.existData(toEmail)) {
            redisUtil.deleteData(toEmail);
        }
        // 이메일 폼 생성
        MimeMessage emailForm = createEmailForm(toEmail);
        // 이메일 발송
        javaMailSender.send(emailForm);
    }

    // 코드 검증
    public Boolean verifyEmailCode(String email, String code) {
        if (redisUtil == null) {


            log.warn("Redis is not available, email verification is disabled");
            return false;
        }
        
        String codeFoundByEmail = redisUtil.getData(email);
        log.info("code found by email: " + codeFoundByEmail);
        if (codeFoundByEmail == null) {
            throw new BusinessLogicException(NON_MATCHED);
        }
        return codeFoundByEmail.equals(code);
    }

    public void sendTempPasswordEmail(String to, String tempPassword) {
        String subject = "[Ingredients] 임시 비밀번호 안내";
        String content = """
                <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                    <h2>임시 비밀번호 발급 안내</h2>
                    <p>아래 임시 비밀번호로 로그인 후, 반드시 비밀번호를 변경해주세요.</p>
                    <div style="padding: 10px; background-color: #f5f5f5; border-radius: 5px; width: fit-content;">
                        <b>%s</b>
                    </div>
                    <p>감사합니다.</p>
                </div>
                """.formatted(tempPassword);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true → HTML 형식

            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("임시 비밀번호 메일 전송 실패", e);
        }
    }
}