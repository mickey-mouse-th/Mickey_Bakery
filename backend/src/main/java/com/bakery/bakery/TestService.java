package com.bakery.bakery;

import org.springframework.stereotype.Component;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ReqUtils;
import com.bakery.bakery.util.ResUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.*;

@Component("test")
public class TestService implements ApiHandler {

    @Override
    public void handle(String action, HttpServletRequest req, HttpServletResponse res) {
        switch (action) {
            case "query": query(req, res); break;
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
}

