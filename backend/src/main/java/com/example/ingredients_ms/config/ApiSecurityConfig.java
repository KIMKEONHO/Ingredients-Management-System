package com.example.ingredients_ms.config;

import com.example.ingredients_ms.global.security.JwtAuthorizationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class ApiSecurityConfig {

    private final JwtAuthorizationFilter jwtAuthorizationFilter;

    @Bean
    @Order(1)
    public SecurityFilterChain apifilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/**")
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        // 기본 회원가입, 로그인
                        .requestMatchers(HttpMethod.POST, "/api/*/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/*/users/signup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/users/me").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/users/logout").permitAll()

                        // 이메일 인증
                        .requestMatchers(HttpMethod.POST, "/api/*/email/send").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/*/email/verify").permitAll()

                        // 식재료 카테고리 api
                        .requestMatchers(HttpMethod.POST, "/api/*/category/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/category/").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/*/category/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/category/*").hasRole("ADMIN")


                        // 식재료 관리 api
                        .requestMatchers(HttpMethod.DELETE, "/api/*/ingredient/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/ingredient/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/ingredient/category/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/ingredient/").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/*/ingredient/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/ingredient/").hasRole("ADMIN")


                        // 재고 관리 api
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/*/inventory/*").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/*/inventory/*").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/*/inventory/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/cart/item/**").permitAll()

                        // 컴플레인 관리 api
                        .requestMatchers(HttpMethod.POST, "/api/*/complaints/*").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/*/complaints/*/status/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/complaints/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/complaints/*").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/*/complaints/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/complaints/users").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/*/complaints/*").permitAll()

                        // 식단 관리 api
                        .requestMatchers(HttpMethod.POST, "/api/*/diet/add").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/diet/**").permitAll()
                )
                .csrf(csrf->csrf.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .cors(cors -> cors.configurationSource(configurationSource()))
                .formLogin(formLogin -> formLogin.disable())
                .sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(
                        jwtAuthorizationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


                return http.build();
    }

    public CorsConfigurationSource configurationSource(){
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "https://api.ms.mkfood.site",
                "https://ms.mkfood.site"
        ));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
