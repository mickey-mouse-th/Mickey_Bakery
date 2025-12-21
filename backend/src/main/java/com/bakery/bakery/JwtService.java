package com.bakery.bakery;

import org.springframework.stereotype.Service;

import com.bakery.bakery.util.ReqUtils;

import org.springframework.beans.factory.annotation.Value;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtParserBuilder;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class JwtService {

    private final Key accessKey;
    private final Key refreshKey;

    public JwtService(@Value("${jwt.access.secret}") String accessSecret,
                      @Value("${jwt.refresh.secret}") String refreshSecret) {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes());
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes());
    }

    public String generateAccess(Map<String, Object> info) {
    	int expire_minute = 15;
    	info.put("expire_minute", expire_minute);
    	
    	JwtBuilder builder = Jwts.builder();
    	setFieldToClaims(builder, info, "accId");
    	setFieldToClaims(builder, info, "expire_minute");
    	
    	builder.setExpiration(Date.from(Instant.now().plus(expire_minute, ChronoUnit.MINUTES))).signWith(accessKey, SignatureAlgorithm.HS256);
    	
        return builder.compact();
    }

    public String generateRefresh(Map<String, Object> info) {
    	int expire_day = 7;
    	info.put("expire_day", expire_day);
    	
    	JwtBuilder builder = Jwts.builder();
    	setFieldToClaims(builder, info, "accId");
    	setFieldToClaims(builder, info, "deviceId");
    	setFieldToClaims(builder, info, "expire_day");
    	
    	builder.setExpiration(Date.from(Instant.now().plus(expire_day, ChronoUnit.DAYS))).signWith(refreshKey, SignatureAlgorithm.HS256);
    	
        return builder.compact();
    }

    public Long verifyRefresh(HttpServletRequest req) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String token = params.get("token");
        Object id = Jwts.parserBuilder()
                .setSigningKey(refreshKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id");
        return ((Number) id).longValue();
    }
    
    protected Claims parseRefresh(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(refreshKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims;
    }
    
    protected Claims parseAccess(String token) {
    	Claims claims = 
    			Jwts.parserBuilder()
	    		.setSigningKey(accessKey)
	    		.build()
	    		.parseClaimsJws(token)
	    		.getBody();
    	
        return claims;
    }
    
    protected Claims parseAccess(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h == null || !h.startsWith("Bearer ")) {
            throw new RuntimeException("Missing access token");
        }
        return parseAccess(h.substring(7));
    }
    
    private void setFieldToClaims(JwtBuilder claims, Map<String, Object> info, String field) {
    	Object value = info.get(field);
    	if (value != null) {
    		claims.claim(field, value);
    	}
    }

}
