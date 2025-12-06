package com.bakery.bakery.util;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@Component
public class ReqUtils {
	public static Map<String, String> getAllParams(HttpServletRequest req) {
	    Map<String, String> result = new HashMap<>();

	    req.getParameterMap().forEach((k, v) -> {
	        if (v != null && v.length > 0) {
	            result.put(k, v[0].trim());
	        }
	    });

	    return result;
	}
}
