package com.example.ingredients_ms.global.security;

import lombok.Getter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

@Getter
public class SecurityUser extends User implements OAuth2User {

    private final long id;
    private Map<String, Object> attributes;

    // 일반 로그인시 사용할 생성자
    public SecurityUser(long id, String username, String password,
                        Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.id = id;
    }

    public SecurityUser(long id, String username, String password,
                        Collection<? extends GrantedAuthority> authorities,
                        Map<String, Object> attributes) {
        super(username, password, authorities);
        this.id = id;
        this.attributes = attributes;
    }

    public Authentication getAuthentication() {
        return new UsernamePasswordAuthenticationToken(
                this,
                this.getPassword(),
                this.getAuthorities()
        );
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(this.id);
    }
}