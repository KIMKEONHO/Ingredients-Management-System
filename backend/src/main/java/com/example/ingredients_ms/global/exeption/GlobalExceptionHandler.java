package com.example.ingredients_ms.global.exeption;

import com.example.ingredients_ms.global.rsdata.RsData;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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