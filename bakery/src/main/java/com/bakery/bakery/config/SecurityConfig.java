package com.bakery.bakery.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // ปิด CSRF สำหรับ API
            .authorizeHttpRequests(auth -> auth
            	// .requestMatchers("/api/test", "/api/query").permitAll()
            	// .anyRequest().authenticated()
                .anyRequest().permitAll() // อนุญาตทุก request
            );
        return http.build();
    }
}
