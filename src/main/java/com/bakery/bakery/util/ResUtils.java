package com.bakery.bakery.util;

import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

@Component
public class ResUtils {
    public static void responseJsonResult(HttpServletResponse res, Object obj) {
        res.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = res.getWriter()) {
            // แปลง object เป็น JSON string
            out.print(new ObjectMapper().writeValueAsString(obj));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
