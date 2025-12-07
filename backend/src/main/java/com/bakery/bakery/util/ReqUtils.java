package com.bakery.bakery.util;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.exc.StreamReadException;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class ReqUtils {
	public static Map<String, String> getAllParams(HttpServletRequest req) {
		Map<String, String> params = new HashMap<>();
		req.getParameterMap().forEach((k, v) -> params.put(k, v[0]));
		
		if ("POST".equalsIgnoreCase(req.getMethod()) && req.getContentType() != null &&
		    req.getContentType().contains("application/json")) {
		    try {
				params.putAll(new ObjectMapper().readValue(req.getInputStream(), Map.class));
			} catch (StreamReadException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (DatabindException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

	    return params;
	}
}
