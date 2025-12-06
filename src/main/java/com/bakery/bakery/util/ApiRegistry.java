package com.bakery.bakery.util;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class ApiRegistry {
    private final Map<String, ApiHandler> registry = new HashMap<>();

    public void register(String module, ApiHandler handler) {
        registry.put(module, handler);
    }

    public ApiHandler getHandler(String module) {
        return registry.get(module);
    }
}
