package com.bakery.bakery.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ApiRegistry;
import com.bakery.bakery.util.ResUtils;

import java.util.Map;

@RestController
@RequestMapping("/bakery-api")
public class MainController {

    @Autowired
    private ApiRegistry apiRegistry;

    @RequestMapping("/{module}/{action}")
    public void handle(@PathVariable String module, @PathVariable String action, HttpServletRequest req, HttpServletResponse res) {
        ApiHandler handler = apiRegistry.getHandler(module);

        if (handler == null) {
        	ResUtils.responseJsonResult(res, Map.of("status", "NO", "reason", "Unknown module: " + module));
        	return;
        }
        
        if (("user".equals(module) && ("register".equals(action) || "login".equals(action))) || "test".equals(module)) {
        	// skip authorize
        	
        } else {
        	HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("accId") == null) {
            	ResUtils.responseJsonResult(res, Map.of("status", "NO", "reason", "Unauthorized"));
            }
        }

        try {
        	handler.handle(action, req, res);
        } catch (Exception e) {
        	ResUtils.responseJsonResult(res, Map.of("status", "NO", "reason", e.getMessage()));
        }
    }
}

