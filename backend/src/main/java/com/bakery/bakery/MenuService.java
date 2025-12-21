package com.bakery.bakery;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ReqUtils;
import com.bakery.bakery.util.ResUtils;
import com.bakery.bakery.util.SqlUtils;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.*;
import java.util.stream.Collectors;

@Component("menu")
public class MenuService implements ApiHandler {
	
	@Autowired
	JwtService jwtService;
	
    @Override
    public void handle(String action, HttpServletRequest req, HttpServletResponse res) {
        switch (action) {
            case "load":  load(req, res); break;
            default:  ResUtils.responseJsonResult(res, Map.of("error", "Unknown action: " + action));
        }
    }

    public void load(HttpServletRequest req, HttpServletResponse res) {
    	Claims claims = jwtService.parseAccess(req);
    	Long accId = claims.get("accId", Long.class);
    	
    	QBakery qb = new QBakery();
    	qb.addTable("Account").field("id accId, roleType").filter(Map.of("accId", accId));
    	qb.isDiag = true;
    	List<Map<String, Object>> list = qb.listData();
    	
    	boolean isAdmin = false;
    	if (list.size() > 0) {
    		Map<String, Object> list0 = list.get(0);
        	Integer roleType = (Integer) list0.get("roleType");
        	isAdmin = roleType == 1;
    	}
    	
        Map<String, String> adminPage = Map.of(
            "admin-recipe", "BakeryAdminRecipe",
            "manage-role", "BakeryManageRole",
            "ingredient", "BakeryIngredient",
            "cost", "BakeryCost",
            "dashboard", "BakeryDashboard"
        );
        Map<String, String> adminForm = Map.of(
            "form:admin-recipe", "BakeryAdminRecipeForm",
            "form:manage-role", "BakeryManageRoleForm",
            "form:ingredient", "BakeryIngredientForm",
            "form:cost", "BakeryCostForm",
            "form:dashboard", "BakeryDashboardForm"
        );

        Map<String, String> sharePage = Map.of(
            "login", "BakeryUser",
            "user-recipe", "BakeryUserRecipe"
        );

        Map<String, String> shareForm = Map.of(
            "form:user-recipe", "BakeryUserRecipeForm"
        );
        
        String MENU =  """
                var M = window.M || {};
                M.initMENU = function() {
                    M.MENU || {};

                    %s%svar user_page = {};
                    var user_form = {};
                    var share_page = %s;
                    var share_form = %s;

                    M.MENU.user = {
                        page: user_page,
                        form: user_form,
                        default: 'BakeryUserRecipe'
                    };

                    M.MENU.share = {
                        page: share_page,
                        form: share_form,
                        default: ''
                    };
                    
                    %s
                }
                """.formatted(
                    isAdmin ? "    var admin_page = " + toJsObject(adminPage) + ";\n" : "",
                    isAdmin ? "    var admin_form = " + toJsObject(adminForm) + ";\n" : "",
                    toJsObject(sharePage),
                    toJsObject(shareForm),
                    isAdmin ?  """
                    		M.MENU.admin = {
	                            page: admin_page,
	                            form: admin_form,
	                            default: 'BakeryAdminRecipe'
	                        };
                    		""" : ""
                );
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK", "MENU", MENU));
    }

    private String toJsObject(Map<String, String> map) {
        return map.entrySet()
            .stream()
            .map(e -> "'" + e.getKey() + "': '" + e.getValue() + "'")
            .collect(Collectors.joining(", ", "{", "}"));
    }
}

