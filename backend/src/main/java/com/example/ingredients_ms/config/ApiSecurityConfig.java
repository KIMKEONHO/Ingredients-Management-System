package com.example.ingredients_ms.config;

import com.example.ingredients_ms.global.security.JwtAuthorizationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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

                        // 식품 재고 사용량 로그 통계 api
                        .requestMatchers(HttpMethod.GET, "/api/*/consumedlog/thismonth").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/consumedlog/thisweek").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/consumedlog/monthly").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/consumedlog/thisyear").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/consumedlog/last3months").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/consumedlog/all").hasAnyRole("USER","ADMIN")

                        // 재고 관리 api
                        .requestMatchers(HttpMethod.PUT, "/api/*/inventory/").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/*/inventory/**").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/inventory/").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/places").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/place").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/my").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/category/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/inventory/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/expiring-soon").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/statistics/ingredients").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/inventory/statistics/most/consumed").hasAnyRole("USER","ADMIN")

                        // 식재료 api
                        .requestMatchers(HttpMethod.GET, "/api/*/ingredient/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/*/ingredient/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/ingredient/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/ingredient/").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/ingredient/").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/ingredient/category/*").hasAnyRole("USER","ADMIN")

                        // 민원 피드백 api
                        .requestMatchers(HttpMethod.PUT, "/api/*/feedback/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/feedback/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/feedback/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/feedback/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/feedback").hasAnyRole("ADMIN")

                        // 장바구니 아이템 api
                        .requestMatchers(HttpMethod.GET, "/api/*/cart/item").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/cart/item").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/cart/item/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/*/cart/item/*").hasAnyRole("USER","ADMIN")

                        // 유저 정보 관리 api
                        .requestMatchers(HttpMethod.POST, "/api/*/users/signup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/*/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/*/users/exchange/phone").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/users/exchange/password").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/users/exchange/nickname").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/users/me").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/users/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/*/users/findPW").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/users/findID").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/*/users/withdraw").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST,"/api/*/users/admin/login").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/*/users/profile").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST,"/api/*/users/change/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/*/users/drop/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,"/api/*/users/change/userdata").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,"/api/*/users/exchange/profile").hasAnyRole("USER","ADMIN")

                        // 유저 통계 및 관리 api
                        .requestMatchers(HttpMethod.GET, "/api/*/users/statistics/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/users/statistics/*").hasRole("ADMIN")

                        // 이메일 관련 api
                        .requestMatchers(HttpMethod.POST, "/api/*/email/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/*/email/send").permitAll()

                        // 식단 관리 api
                        .requestMatchers(HttpMethod.POST, "/api/*/diet/add").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/diet/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/*/diet/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/diet/*/*").hasAnyRole("USER","ADMIN")

                        // 식단 통계 api
                        .requestMatchers(HttpMethod.GET, "/api/*/diet/statistics/week").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/diet/statistics/month").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/diet/statistics/quarter").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/diet/statistics/year").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/diet/statistics/week/graph").hasAnyRole("USER","ADMIN")

                        // 민원 관리 api
                        .requestMatchers(HttpMethod.POST, "/api/*/complaints/").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/complaints/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/*/complaints/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/*/complaints/*/status/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/complaints/*").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/complaints/users").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/complaints/all").hasAnyRole("USER","ADMIN")

                        // 식재료 카테고리 관리 api
                        .requestMatchers(HttpMethod.PUT, "/api/*/category/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/*/category/*").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/category/").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/*/category/").hasAnyRole("ADMIN")

                        // 이미지 업로드 관련 api
                        .requestMatchers(HttpMethod.POST,"/api/*/images/upload").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/*/images/*").hasAnyRole("USER","ADMIN")

                        // 레시피 관련 api
                        .requestMatchers(HttpMethod.POST, "/api/*/recipe/").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET,"/api/*/recipe/all").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET,"/api/*/recipe/detail/*").permitAll()
                        .requestMatchers(HttpMethod.DELETE,"/api/*/recipe/*").hasAnyRole("USER","ADMIN")

                        //레시피 좋아요 관련 api
                        .requestMatchers(HttpMethod.POST,"/api/*/recipe/*/like").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/*/recipe/*/like").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET,"/api/*/recipe/*/like").hasAnyRole("USER","ADMIN")

                        // 레시피 추천 관련 api
                        .requestMatchers(HttpMethod.GET, "/api/*/recipe/recommend/").hasAnyRole("USER","ADMIN")
                )
                .csrf(csrf->csrf.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .cors(cors -> cors.configurationSource(configurationSource()))
                .formLogin(formLogin -> formLogin.disable())
                .sessionManagement(sessionManagement -> sessionManagement.disable())
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
