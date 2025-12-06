package com.bakery.bakery;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ApiRegistry;
import com.bakery.bakery.util.ResUtils;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.*;

@Component
public class UserService implements ApiHandler {

    @Autowired
    private ApiRegistry registry;

    @PostConstruct
    public void init() {
        registry.register("user", this);
    }

    @Override
    public void handle(String action, HttpServletRequest req, HttpServletResponse res) {
        switch (action) {
            case "list":
                listUsers(req, res);
                break;
            case "add":
                addUser(req, res);
                break;
            default:
                ResUtils.responseJsonResult(res, Map.of("error", "Unknown action: " + action));
        }
    }

    private void listUsers(HttpServletRequest req, HttpServletResponse res) {
    	QBakery qb = new QBakery();
    	qb.addTable("test_users").field("fid, name, email, age");
    	List<Map<String, Object>> list = qb.listData();
        Map<String, Object> result = Map.of(
                "status", "OK",
                "list", list
        );
        ResUtils.responseJsonResult(res, result);
    }

    private void addUser(HttpServletRequest req, HttpServletResponse res) {
        String name = req.getParameter("name");
        if (name == null) {
            res.setStatus(400);
            ResUtils.responseJsonResult(res, Map.of("error", "Missing name"));
            return;
        }

        ResUtils.responseJsonResult(res, Map.of("status", "created", "name", name));
    }
}

