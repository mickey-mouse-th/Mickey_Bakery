package com.bakery.bakery.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

public class ResUtils {

    public static void responseJsonResult(HttpServletResponse res, int statusCode, Object obj) {
        res.setStatus(statusCode);
        res.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = res.getWriter()) {
            out.print(new ObjectMapper().writeValueAsString(obj));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void responseJsonResult(HttpServletResponse res, Object obj) {
        responseJsonResult(res, HttpServletResponse.SC_OK, obj);
    }

    public static void checkRequired(HttpServletResponse res, Object value, String message) {
        if (value == null || (value instanceof String && ((String) value).isBlank())) {
            responseJsonResult(res, HttpServletResponse.SC_BAD_REQUEST, Map.of(
                "status", "NO",
                "reason", message
            ));
            throw new RuntimeException("Required parameter missing: " + message);
        }
    }
}
