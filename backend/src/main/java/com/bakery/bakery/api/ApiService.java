package com.bakery.bakery.api;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ApiRegistry;

import jakarta.annotation.PostConstruct;

@Component
public class ApiService {

    @Autowired private ApiRegistry registry;
    @Autowired  private ApplicationContext context;

    @PostConstruct
    public void init() {
        Map<String, ApiHandler> beans = context.getBeansOfType(ApiHandler.class);

        for (Map.Entry<String, ApiHandler> e : beans.entrySet()) {
            String beanName = e.getKey();   // ← "ingredient", "user"
            ApiHandler handler = e.getValue();

            registry.register(beanName, handler);
            System.out.println("✅ Registered API: " + beanName);
        }
    }
}

