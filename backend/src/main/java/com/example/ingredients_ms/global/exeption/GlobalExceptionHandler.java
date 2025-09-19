package com.example.ingredients_ms.global.exeption;

import com.example.ingredients_ms.global.rsdata.RsData;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.data.redis.RedisSystemException;

import java.util.Objects;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 비즈니스 로직에서 발생하는 예외 처리
     */
    @ExceptionHandler(BusinessLogicException.class)
    public ResponseEntity<RsData<?>> handleBusinessLogicException(BusinessLogicException ex) {
        ExceptionCode code = ex.getExceptionCode();

        return ResponseEntity
                .status(HttpStatus.valueOf(code.getStatus()))
                .body(new RsData<>(
                        String.valueOf(code.getStatus()),
                        code.getMessage()
                ));
    }

    /**
     * 요청 값 검증 실패 (예: @Valid, @NotNull)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RsData<?>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = Objects.requireNonNull(ex.getBindingResult().getFieldError())
                .getDefaultMessage();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new RsData<>(
                        String.valueOf(HttpStatus.BAD_REQUEST.value()),
                        errorMessage
                ));
    }

    /**
     * 세션 무효화 관련 예외 처리
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<RsData<?>> handleSessionInvalidatedException(IllegalStateException ex) {
        if (ex.getMessage() != null && ex.getMessage().contains("Session was invalidated")) {
            // JWT 기반 인증에서는 세션이 없어야 하므로 이 오류가 발생하면 안됨
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RsData<>(
                            String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
                            "인증 시스템 오류가 발생했습니다. 관리자에게 문의하세요."
                    ));
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new RsData<>(
                        String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
                        "서버 내부 오류가 발생했습니다."
                ));
    }

    /**
     * Redis 시스템 예외 처리
     */
    @ExceptionHandler(RedisSystemException.class)
    public ResponseEntity<RsData<?>> handleRedisSystemException(RedisSystemException ex) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new RsData<>(
                        String.valueOf(HttpStatus.SERVICE_UNAVAILABLE.value()),
                        "Redis 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
                ));
    }

    /**
     * HTTP 메시지 직렬화 예외 처리
     */
    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<RsData<?>> handleHttpMessageNotWritableException(HttpMessageNotWritableException ex) {
        if (ex.getMessage() != null && ex.getMessage().contains("Session was invalidated")) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new RsData<>(
                            String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                            "세션이 만료되었습니다. 다시 로그인해주세요."
                    ));
        }
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new RsData<>(
                        String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
                        "응답 생성 중 오류가 발생했습니다."
                ));
    }

    /**
     * 그 외 처리되지 않은 예외
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RsData<?>> handleGenericException(Exception ex) {
        ex.printStackTrace(); // 로그 출력 (운영에서는 로깅 라이브러리 사용)

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new RsData<>(
                        String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
                        "서버 내부 오류가 발생했습니다."
                ));
    }
}