package com.example.ingredients_ms.global.jwt;

import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.global.util.Ut;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtProvider {
    @Value("${custom.jwt.secretKey}")
    private String secretKey;

    @Value("${custom.accessToken.expirationSeconds}")
    private int accessTokenExpiration;

    private SecretKey cachedSecretKey;

    public SecretKey getSecretKey() {
        if(cachedSecretKey == null) {
            cachedSecretKey = _getSecretKey();
        }
        return cachedSecretKey;
    }

    private SecretKey _getSecretKey() {
        String keyBase64Encoded = Base64.getEncoder().encodeToString(secretKey.getBytes());
        return Keys.hmacShaKeyFor(keyBase64Encoded.getBytes());
    }


    public String genAccessToken(User user) {
        return genToken(user, accessTokenExpiration); //10분 동안 유효한 토큰 생성
    }

    public String genRefreshToken(User user) {
        return genToken(user, 60 * 60 * 24 * 7); // 일주일 동안 유효한 refresh 토큰 생성
    }

    public String genToken(User user, int seconds) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("username", user.getUserName());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole());
        long now = new Date().getTime();
        Date accessTokenExpiresln= new Date(now + seconds * 1000);
        return Jwts.builder()
                .claim("body", Ut.json.toStr(claims)) // 맵으로 만든애를 json으로 만들어서 body에 담음
                .setExpiration(accessTokenExpiresln)
                .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Map<String, Object> getClaims(String token) {
        String body = Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("body", String.class);
        return Ut.toMap(body);
    }

    public boolean verify(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        }catch (Exception e){
            return false;
        }
    }
}
