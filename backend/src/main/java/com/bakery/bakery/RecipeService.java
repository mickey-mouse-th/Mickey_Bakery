package com.bakery.bakery;

import org.springframework.stereotype.Component;

import com.bakery.bakery.util.ApiHandler;
import com.bakery.bakery.util.ReqUtils;
import com.bakery.bakery.util.ResUtils;
import com.bakery.bakery.util.SqlUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.*;

@Component("recipe")
public class RecipeService implements ApiHandler {

    @Override
    public void handle(String action, HttpServletRequest req, HttpServletResponse res) {
        switch (action) {
            case "list": list(req, res); break;
            case "load": load(req, res); break;
            
            case "insert": insert(req, res); break;
            case "update": update(req, res); break;
            case "delete": delete(req, res); break;
            default:  ResUtils.responseJsonResult(res, Map.of("error", "Unknown action: " + action));
        }
    }

    public void list(HttpServletRequest req, HttpServletResponse res) {
        QBakery qb = new QBakery();
        qb.addTable("Recipe").field("id, name, solnList, note");
        List<Map<String, Object>> list = qb.listData();

        ResUtils.responseJsonResult(res, Map.of("status", "OK", "list", list));
    }
    
    public void load(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String name = params.get("name");
    	String id = params.get("id");
    	
    	Map<String, String> filter = new HashMap<String, String>();
    	if (!id.isEmpty()) {
    		filter.put("id", id);
    		
    	} else {
    		if (!name.isEmpty()) {
    			filter.put("name", name);
    		}
    	}
        
        QBakery qb = new QBakery();
        qb.addTable("Recipe").field("id recipeId, name recipeId_NAME, solnList, note");
        qb.addTable("RecipeLink").joinOn("recipeId").field("id linkId, recipeId, ingredientId, quantity, stepNo");
        qb.addTable("Ingredient").joinOn("ingredientId").field("id ingredientId, name ingredientId_NAME, unit");
        qb.isDiag = true;
        List<Map<String, Object>> list = qb.listData();

        ResUtils.responseJsonResult(res, Map.of("status", "OK", "list", list));
    }
    
    // TODO
    public void insert(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String name = params.get("name");
    	String quantity = params.get("quantity");
    	String unit = params.get("unit");
    	String price = params.get("price");
    	String note = params.get("note");
    	
    	ResUtils.checkRequired(res, name, "name is required");
    	ResUtils.checkRequired(res, quantity, "quantity is required");
    	ResUtils.checkRequired(res, unit, "unit is required");
    	ResUtils.checkRequired(res, price, "price is required");
    	ResUtils.checkRequired(res, note, "note is required");

    	Map<String, Object> info = new HashMap<String, Object>();
        info.put("name", name);
        info.put("quantity", quantity);
        info.put("unit", unit);
        info.put("price", price);
        info.put("note", note);
        
        SqlUtils sql = new SqlUtils();
        sql.insert("Ingredient", info);
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK"));
    }
    
    public void update(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String id = params.get("id");
    	String name = params.get("name");
    	String quantity = params.get("quantity");
    	String unit = params.get("unit");
    	String price = params.get("price");
    	String note = params.get("note");
    	
    	ResUtils.checkRequired(res, id, "id is required");
    	ResUtils.checkRequired(res, name, "name is required");
    	ResUtils.checkRequired(res, quantity, "quantity is required");
    	ResUtils.checkRequired(res, unit, "unit is required");
    	ResUtils.checkRequired(res, price, "price is required");
    	ResUtils.checkRequired(res, note, "note is required");

    	Map<String, Object> info = new HashMap<String, Object>();
    	info.put("id", id);
        info.put("name", name);
        info.put("quantity", quantity);
        info.put("unit", unit);
        info.put("price", price);
        info.put("note", note);
        
        SqlUtils sql = new SqlUtils();
        sql.update("Ingredient", info);
        
        ResUtils.responseJsonResult(res, Map.of("status", "OK"));
    }
    
    public void delete(HttpServletRequest req, HttpServletResponse res) {
    	Map<String, String> params = ReqUtils.getAllParams(req);
    	String id = params.get("id");
    	
    	ResUtils.checkRequired(res, id, "id is required");
    	
    	SqlUtils sql = new SqlUtils();
        sql.delete("Ingredient", id);

        ResUtils.responseJsonResult(res, Map.of("status", "OK"));
    }
}

