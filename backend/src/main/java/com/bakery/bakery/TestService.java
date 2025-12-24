package com.bakery.bakery;

import org.springframework.stereotype.Component;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ReqUtils;
import com.bakery.bakery.util.ResUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.util.*;

@Component("test")
public class TestService implements ApiHandler {

    @Override
    public void handle(String action, HttpServletRequest req, HttpServletResponse res) {
        switch (action) {
            case "query": query(req, res); break;
            case "loadSession": loadSession(req, res); break;
            case "insertSession": insertSession(req, res); break;
            case "deleteSession": deleteSession(req, res); break;
            default:
                ResUtils.responseJsonResult(res, Map.of("error", "Unknown action: " + action));
        }
    }

    private void query(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String name = params.get("name");
    	String age = params.get("age");
    	
    	QBakery qb = new QBakery();
    	qb.addTable("test_users").field("id fid, name user_name, email, age").filter("name", name, "age", age);
    	List<Map<String, Object>> listData = qb.listData();
    	// List<Map<String, Object>> list = qb.listData();
        
    	Map<String, Object> result = new HashMap<String, Object>();
    	result.put("status", "OK");
    	result.put("list", listData);
        ResUtils.responseJsonResult(res, result);
    }
    
    private void insertSession(HttpServletRequest req, HttpServletResponse res) {
    	HttpSession session = req.getSession(true);
	    session.setAttribute("accId", 6);
	    session.setAttribute("deviceId", "a08346a7-c911-480b-99b3-6a65a8701023");
	    session.setAttribute("deviceName", "MacIntel");
	    session.setAttribute("deviceOS", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36");
    }
    
    private void loadSession(HttpServletRequest req, HttpServletResponse res) {
    	HttpSession session = req.getSession(false);
    	Map<String, Object> data = new HashMap<>();
    	data.put("accId", session.getAttribute("accId"));
    	data.put("deviceId", session.getAttribute("deviceId"));
    	ResUtils.responseJsonResult(res, data);
    }
    
    private void deleteSession(HttpServletRequest req, HttpServletResponse res) {
    	HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
    
}

