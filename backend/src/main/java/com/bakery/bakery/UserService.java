package com.bakery.bakery;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ReqUtils;
import com.bakery.bakery.util.ResUtils;
import com.bakery.bakery.util.SqlUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component("user")
public class UserService implements ApiHandler {

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void handle(String action, HttpServletRequest req, HttpServletResponse res) {
        switch (action) {
            case "register": register(req, res); break;
            case "login": login(req, res); break;
            case "logout": logout(req, res); break;
            
            case "list": list(req, res); break;
            case "load": load(req, res); break;
            case "changeRoleType": changeRoleType(req, res); break;
            
            default:  ResUtils.responseJsonResult(res, Map.of("error", "Unknown action: " + action));
        }
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
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
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
        list0.remove("passwordHash");
        
        Long accId = (Long) list0.get("accId");
        String deviceId = params.get("deviceId");
        String deviceName = params.get("deviceName");
        String deviceOS = params.get("deviceOS");
        
        HttpSession session = req.getSession(true);
        session.setAttribute("accId", accId);
        session.setAttribute("deviceId", deviceId);
        session.setAttribute("deviceName", deviceName);
        session.setAttribute("deviceOS", deviceOS);
        
        Map<String, Object> loginInfo = Map.of("accId", accId, "deviceId", deviceId, "loginDate", OffsetDateTime.now());
        SqlUtils sql = new SqlUtils();
        sql.insert("loginHistory", loginInfo);
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK", "user", list0));
    }

    public void logout(HttpServletRequest req, HttpServletResponse res) {
    	HttpSession session = req.getSession(false);
        if (session != null) {
        	Long accId = (Long) session.getAttribute("accId");
        	String deviceId = (String) session.getAttribute("deviceId");
            session.invalidate();
            
            QBakery qb = new QBakery();
            qb.addTable("loginHistory").filter("id", accId, "deviceId", deviceId).field("id, deviceId");
            List<Map<String, Object>> loginHistoryList = qb.listData();
            loginHistoryList.stream().forEach(o -> o.put("logoutDate", OffsetDateTime.now()));
            
            SqlUtils sql = new SqlUtils();
            sql.updateList("loginHistory", loginHistoryList);
        }
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK"));
    }

    public void list(HttpServletRequest req, HttpServletResponse res) {
        QBakery qb = new QBakery();
        qb.addTable("Account").field("id accId, name, username, roleType, tagList, creDate");
        List<Map<String, Object>> list = qb.listData();

        ResUtils.responseJsonResult(res, Map.of("status", "OK", "list", list));
    }
    
    public void load(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String name = params.get("name");
    	String accId = params.get("accId");
    	
    	Map<String, Object> filter = new HashMap<String, Object>();
    	if (!accId.isEmpty()) {
    		filter.put("accId", accId);
    		
    	} else {
    		if (!name.isEmpty()) {
    			filter.put("name", name);
    		}
    	}
        
        QBakery qb = new QBakery();
        qb.addTable("Account").filter(filter).field("id accId, name, username, roleType, tagList, creDate");
        List<Map<String, Object>> list = qb.listData();

        ResUtils.responseJsonResult(res, Map.of("status", "OK", "list", list));
    }
    
    public void changeRoleType(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String accId = params.get("accId");
        int roleType = Integer.parseInt(params.getOrDefault("roleType", "0"));
        
        ResUtils.checkRequired(res, accId, "accId is required");
        
        Map<String, Object> info = new HashMap<String, Object>();
        info.put("id", accId);
        info.put("roleType", roleType);
        
        SqlUtils sql = new SqlUtils();
        sql.update("Account", info);
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK"));
    }
}

