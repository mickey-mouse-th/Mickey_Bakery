package com.bakery.bakery.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface ApiHandler {
    void handle(String action, HttpServletRequest req, HttpServletResponse res);
}
