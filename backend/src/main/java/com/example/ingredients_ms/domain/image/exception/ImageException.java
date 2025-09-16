package com.example.ingredients_ms.domain.image.exception;

import com.example.ingredients_ms.global.exeption.ExceptionCode;
import lombok.Getter;

@Getter
public class ImageException extends RuntimeException {
    
    private final ExceptionCode exceptionCode;
    
    public ImageException(ExceptionCode exceptionCode) {
        super(exceptionCode.getMessage());
        this.exceptionCode = exceptionCode;
    }
    
    public ImageException(ExceptionCode exceptionCode, String message) {
        super(message);
        this.exceptionCode = exceptionCode;
    }
}
