package com.bakery.bakery;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

import com.bakery.bakery.util.DB;

public class QBakery {
    public class TableDef {
        private String tableName;
        private String alias;
        private String joinType = "FROM";      // FROM / JOIN / LEFT / RIGHT
        private String joinOn = null;
        private String fieldStr = "";
        private List<String> whereList = new ArrayList<>();
        private StringBuilder whereClause = new StringBuilder();
        private Map<String, String> fieldMap = new HashMap<String, String>();

        public TableDef(String tableName, String alias) {
            this.tableName = tableName;
            this.alias = alias;
        }
        
        public TableDef filter(String... kv) {
        	if (kv == null || kv.length % 2 != 0) {
                throw new IllegalArgumentException("filter requires key/value pairs");
            }
        	
            for (int i = 0; i < kv.length; i += 2) {
                String col = kv[i].toString();
                String val = kv[i + 1];
                if (val == null || val.isEmpty()) continue;
                String field = fieldMap.get(col);
                if (field != null && !field.isEmpty()) {
                	col = field;
                }
                appendWhere(alias + "." + col + " = ?");
                params.add(val);
                /*
                if (col.endsWith(">")) {
                	appendWhere(alias + "." + col.replace(">", "") + " > ?");
                    params.add(val);
                } else if (col.endsWith("<")) {
                	appendWhere(alias + "." + col.replace("<", "") + " < ?");
                    params.add(val);
                } else if (col.toLowerCase().contains("between")) {
                    String[] v = val.split(",");
                    appendWhere(alias + "." + col.replace("between", "").trim() + " BETWEEN ? AND ?");
                    params.add(v[0].trim());
                    params.add(v[1].trim());
                } else {
                	appendWhere(alias + "." + col + " = ?");
                    params.add(val);
                }
                */
            }
            return this;
        }
        public TableDef where(String sql, Object... values) {
            appendWhere(sql);
            params.addAll(Arrays.asList(values));
            return this;
        }
        private void appendWhere(String s) {
            if (whereClause.length() == 0) {
                whereClause.append("WHERE ").append(s);
            } else {
                whereClause.append(" ").append(s);
            }
        }
        public StringBuilder getWhere() {
        	return whereClause;
        }

        public TableDef field(String f) {
        	List<String> fsArr = Arrays.asList(f.split(","));
        	this.fieldStr = fsArr.stream()
        	    .map(String::trim)
        	    .filter(s -> !s.isEmpty())
        	    .map(o -> {
        	        List<String> fArr = Arrays.stream(o.split(" "))
        	                                  .filter(s -> !s.isEmpty())
        	                                  .collect(Collectors.toList());
        	        String fieldFo = fArr.get(0);
        	        String fieldTo = fArr.size() >=2 ? fArr.get(1) : "";
        	        setFieldList(!fieldTo.isEmpty() ? fieldTo : fieldFo);
        	        if (!fieldTo.isEmpty()) fieldMap.put(fieldTo, fieldFo);
        	        return alias + "." + "\"" + fieldFo + "\"" + (!fieldTo.isEmpty() ? (" AS " + fieldTo) : "");
        	    })
        	    .collect(Collectors.joining(","));
            return this;
        }
        public String getField() {
        	return fieldStr;
        }
        
        public List<String> getWhereList() {
        	return whereList;
        }
        public List<Object> getParams() {
        	return params;
        }

        public TableDef joinOn(String condition) {
            this.joinType = "JOIN";
            this.joinOn = condition;
            return this;
        }

        public TableDef leftJoinOn(String condition) {
            this.joinType = "LEFT JOIN";
            this.joinOn = condition;
            return this;
        }

        public TableDef rightJoinOn(String condition) {
            this.joinType = "RIGHT JOIN";
            this.joinOn = condition;
            return this;
        }
        
//        public String getFields() {
//        	String tableName2 = tableName;
//        	for (int i=0; i<fields.size(); i++) {
//        		String field = fields.get(i);
//        		
//        	}
//        	return "";
//        }
    }

    // --- Core Fields ---
    public boolean isDiag = false;
    List<TableDef> tables = new ArrayList<>();
//    List<String> whereList = new ArrayList<>();
    private List<Object> params = new ArrayList<>();
    List<String> orderList = new ArrayList<>();
    List<String> groupList = new ArrayList<>();
    List<String> havingList = new ArrayList<>();
    List<String> selectedFields = new ArrayList<>();
    private List<String> fieldList = new ArrayList<>();

    Integer limit = null;
    Integer offset = null;

    // --- INSERT / UPDATE / DELETE ---
    Map<String, Object> insertValues = new LinkedHashMap<>();
    Map<String, Object> updateValues = new LinkedHashMap<>();
    String targetTable = null;
    String command = "SELECT";  // SELECT / INSERT / UPDATE / DELETE

    public TableDef addTable(String tableName) {
        String alias = "t" + (tables.size() + 1);
        TableDef t = new TableDef(tableName, alias);
        tables.add(t);
        return t;
    }

    public QBakery setFields(String fieldsCommaSeparated) {
        if (fieldsCommaSeparated == null) return this;

        String[] parts = fieldsCommaSeparated.split(",");
        for (String p : parts) {
            String f = p.trim();
            if (!f.isEmpty()) {
                selectedFields.add(f);
            }
        }
        return this;
    }

    public QBakery where(String condition, Object... ps) {
//        whereList.add("(" + condition + ")");
//        params.addAll(Arrays.asList(ps));
        return this;
    }

    public QBakery orWhere(String condition, Object... ps) {
//        if (whereList.isEmpty()) {
//            return where(condition, ps);
//        }
//        whereList.add("OR (" + condition + ")");
//        params.addAll(Arrays.asList(ps));
        return this;
    }

    public QBakery groupBy(String field) {
        groupList.add(field);
        return this;
    }

    public QBakery having(String condition) {
        havingList.add(condition);
        return this;
    }

    public QBakery orderBy(String field, boolean asc) {
        orderList.add(field + (asc ? " ASC" : " DESC"));
        return this;
    }

    public QBakery limit(int l) {
        this.limit = l;
        return this;
    }

    public QBakery offset(int o) {
        this.offset = o;
        return this;
    }

    public QBakery loadMore(String idField, Object lastId) {
        where(idField + " > ?", lastId);
        return this;
    }

    public QBakery insertInto(String table) {
        this.command = "INSERT";
        this.targetTable = table;
        return this;
    }

    public QBakery value(Map<String, Object> values) {
        insertValues.putAll(values);
        return this;
    }

    public QBakery update(String table) {
        this.command = "UPDATE";
        this.targetTable = table;
        return this;
    }

    public QBakery set(String col, Object val) {
        updateValues.put(col, val);
        return this;
    }

    private void setFieldList(String field) {
    	if (!fieldList.contains(field)) {
    		fieldList.add(field);
    	}
    }
    private List<String> getFieldList() {
    	return fieldList;
    }
    
    public QBakery deleteFrom(String table) {
        this.command = "DELETE";
        this.targetTable = table;
        return this;
    }

    public String buildSQL() {
        switch (command) {

//            case "INSERT":
//                return buildInsert();
//
//            case "UPDATE":
//                return buildUpdate();
//
//            case "DELETE":
//                return buildDelete();

            default:
                return buildSelect();
        }
    }

    // --- SELECT ---
    private String buildSelect() {
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < tables.size(); i++) {
            TableDef t = tables.get(i);
            String fields = t.getField();
            if (i == 0) {
            	sb.append("SELECT " + (fields.isEmpty() ? "*" : fields));
            	sb.append("\nFROM ");
                sb.append("\"" + t.tableName + "\"").append(" ").append(t.alias);
            } else {
                sb.append("\n").append(t.joinType)
                  .append(" ").append("\"" + t.tableName + "\"").append(" ").append(t.alias)
                  .append(" ON ").append(t.joinOn);
            }
            StringBuilder where = t.getWhere();
            if (!where.isEmpty()) {
              sb.append("\n" + where);
          }
        }

        // GROUP BY
        if (!groupList.isEmpty()) {
            sb.append("\nGROUP BY ").append(String.join(", ", groupList));
        }

        // HAVING
        if (!havingList.isEmpty()) {
            sb.append("\nHAVING ").append(String.join(" AND ", havingList));
        }

        // ORDER BY
        if (!orderList.isEmpty()) {
            sb.append("\nORDER BY ").append(String.join(", ", orderList));
        }

        // LIMIT / OFFSET
        if (limit != null) sb.append("\nLIMIT ").append(limit);
        if (offset != null) sb.append(" OFFSET ").append(offset);

        return sb.toString();
    }

    // --- INSERT SQL ---
    private String buildInsert() {
        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO ").append(targetTable).append(" (");

        sb.append(String.join(", ", insertValues.keySet()));
        sb.append(")\nVALUES (");

        String q = String.join(", ", Collections.nCopies(insertValues.size(), "?"));
        sb.append(q).append(")");

        params.clear();
        params.addAll(insertValues.values());

        return sb.toString();
    }
//
//    // --- UPDATE SQL ---
//    private String buildUpdate() {
//        StringBuilder sb = new StringBuilder();
//        sb.append("UPDATE ").append(targetTable).append("\nSET ");
//
//        List<String> sets = new ArrayList<>();
//        for (String c : updateValues.keySet()) {
//            sets.add(c + " = ?");
//        }
//        sb.append(String.join(", ", sets));
//
//        params.clear();
//        params.addAll(updateValues.values());
//
//        if (!whereList.isEmpty()) {
//            sb.append("\nWHERE ").append(String.join(" AND ", whereList));
//        }
//
//        return sb.toString();
//    }
//
//    // --- DELETE SQL ---
//    private String buildDelete() {
//        StringBuilder sb = new StringBuilder();
//        sb.append("DELETE FROM ").append(targetTable);
//
//        if (!whereList.isEmpty()) {
//            sb.append("\nWHERE ").append(String.join(" AND ", whereList));
//        }
//
//        return sb.toString();
//    }
//    
    public List<Map<String,Object>> listData() {
        List<Map<String,Object>> result = new ArrayList<>();

        String sql = buildSelect();
        if (isDiag) {
        	 System.out.println("Executing SQL:\n" + sql); // debug
        }

        try (Connection conn = DB.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            // bind params
            List<Object> ps = getParams();
            for (int i = 0; i < ps.size(); i++) {
                stmt.setObject(i + 1, ps.get(i));
            }

            // execute query
            try (ResultSet rs = stmt.executeQuery()) {
                ResultSetMetaData meta = rs.getMetaData();
                int colCount = meta.getColumnCount();
                while (rs.next()) {
                    Map<String,Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= colCount; i++) {
                        row.put(meta.getColumnLabel(i), rs.getObject(i));
                    }
                    result.add(row);
                }
            }
        } catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

        return result;
    }
    
    public List<Object> getParams() {
    	return params;
    }
}
