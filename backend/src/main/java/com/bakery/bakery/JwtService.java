package com.bakery.bakery;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {

    private final Key accessKey;
    private final Key refreshKey;

    public JwtService(@Value("${jwt.access.secret}") String accessSecret,
                      @Value("${jwt.refresh.secret}") String refreshSecret) {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes());
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes());
    }

    public String generateAccess(Long accId) {
        return Jwts.builder()
                .claim("id", accId)
                .setExpiration(Date.from(Instant.now().plus(15, ChronoUnit.MINUTES)))
                .signWith(accessKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefresh(Long accId) {
        return Jwts.builder()
                .claim("id", accId)
                .setExpiration(Date.from(Instant.now().plus(7, ChronoUnit.DAYS)))
                .signWith(refreshKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long verifyAccess(String token) {
        Object id = Jwts.parserBuilder()
                .setSigningKey(accessKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id");
        return ((Number) id).longValue();
    }

    public Long verifyRefresh(String token) {
        Object id = Jwts.parserBuilder()
                .setSigningKey(refreshKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id");
        return ((Number) id).longValue();
    }
}
