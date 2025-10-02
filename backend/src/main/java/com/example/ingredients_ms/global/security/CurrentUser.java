package com.example.ingredients_ms.global.security;


import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 현재 인증된 사용자 정보를 주입하는 어노테이션
 * Controller 메서드의 파라미터에 사용하여 SecurityUser 객체를 자동으로 주입받을 수 있습니다.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
