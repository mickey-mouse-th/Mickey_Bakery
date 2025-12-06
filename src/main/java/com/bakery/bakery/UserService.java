package com.bakery.bakery;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ApiRegistry;
import com.bakery.bakery.util.ReqUtils;
import com.bakery.bakery.util.ResUtils;
import com.bakery.bakery.util.SqlUtils;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class UserService implements ApiHandler {

    @Autowired private ApiRegistry registry;
    @Autowired private BCryptPasswordEncoder passwordEncoder;
    @Autowired JwtService jwt;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostConstruct
    public void init() {
        registry.register("user", this);
    }

    @Override
    public void handle(String action, HttpServletRequest req, HttpServletResponse res) {
        switch (action) {
            case "list": listUsers(req, res); break;
            case "add": addUser(req, res); break;
            case "register": register(req, res); break;
            case "login": login(req, res); break;
            default:  ResUtils.responseJsonResult(res, Map.of("error", "Unknown action: " + action));
        }
    }

    private void listUsers(HttpServletRequest req, HttpServletResponse res) {
    	QBakery qb = new QBakery();
    	qb.addTable("test_users").field("fid, name, username, age");
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
    
    public void register(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String name = params.get("name");
        String username = params.get("username");
        String password = params.get("password");
        String tagList = params.get("tagList");
        int roleType = Integer.parseInt(params.getOrDefault("roleType", "0"));
        
        ResUtils.checkRequired(res, name, "name is required");
        ResUtils.checkRequired(res, username, "username is required");
        ResUtils.checkRequired(res, password, "password is required");
        
        QBakery qb = new QBakery();
        qb.addTable("Account").filter("username", username).field("id, name, username");
        List<Map<String, Object>> list = qb.listData();
        if (list.size() > 0) {
        	ResUtils.responseJsonResult(res, Map.of("status", "NO", "reason", "User already exists"));
        	return;
        }
        
        String passwordHash = passwordEncoder.encode(password);
        Map<String, Object> info = new HashMap<String, Object>();
        info.put("name", name);
        info.put("username", username);
        info.put("passwordHash", passwordHash);
        info.put("roleType", roleType);
        info.put("tagList", tagList);
        
        SqlUtils sql = new SqlUtils();
        sql.insert("Account", info);
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK", "name", name));
    }

    public void login(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
        String username = params.get("username");
        String password = params.get("password");
        
        QBakery qb = new QBakery();
        qb.addTable("Account").filter("username", username).field("id accId, name, username, passwordHash, roleType, tagList");
        List<Map<String, Object>> list = qb.listData();

        if (list.size() == 0) {
        	ResUtils.responseJsonResult(res, 401, Map.of("status", "NO", "reason", "Invalid credentials"));
        	return;
        }
        Map<String, Object> list0 = list.get(0);
        String passwordHash = (String) list0.get("passwordHash");

        boolean valid = encoder.matches(password, passwordHash);
        if (!valid) {
        	ResUtils.responseJsonResult(res, 401, Map.of("status", "NO", "reason", "Invalid credentials"));
        	return;
        }
        
        Long accId = (Long) list0.get("accId");
        String deviceId = params.get("deviceId");
        String deviceName = params.get("deviceName");
        String deviceOS = params.get("deviceOS");
        
        String accessToken = jwt.generateAccess(accId);
        String refreshToken = jwt.generateRefresh(accId);

        Map<String, Object> info = new HashMap<String, Object>();
        info.put("token", refreshToken);
        info.put("accId", accId);
        info.put("deviceId", deviceId);
        info.put("deviceName", deviceName);
        info.put("deviceOS", deviceOS);
        info.put("expTs", LocalDateTime.now().plusDays(7));
        
        SqlUtils sql = new SqlUtils();
        sql.insert("RefreshToken", info);
        
        list0.remove("passwordHash");
        list0.put("accessToken", accessToken);
        list0.put("refreshToken", refreshToken);
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK", "user", list0));
    }
}

