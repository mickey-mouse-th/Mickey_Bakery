package com.bakery.bakery.util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

public class SqlUtils {

    // ---------------- INSERT ----------------
    public Map<String, Object> insert(String table, Map<String, Object> data) {
        String sql = buildInsertSQL(table, data);
        try (Connection conn = DB.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            setParams(stmt, new ArrayList<>(data.values()));
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                return new HashMap<>(data); // return all fields
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Collections.emptyMap();
    }

    public List<Map<String, Object>> insertList(String table, List<Map<String, Object>> dataList) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (dataList.isEmpty()) return result;

        Map<String, Object> firstRow = dataList.get(0);
        String sql = buildInsertSQL(table, firstRow);

        try (Connection conn = DB.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            for (Map<String, Object> data : dataList) {
                setParams(stmt, new ArrayList<>(data.values()));
                stmt.addBatch();
            }

            int[] counts = stmt.executeBatch();
            for (int i = 0; i < counts.length; i++) {
                if (counts[i] > 0) {
                    result.add(new HashMap<>(dataList.get(i)));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return result;
    }

    // ---------------- UPDATE ----------------
    public Map<String, Object> update(String table, Map<String, Object> data) {
        if (!data.containsKey("id")) {
            throw new IllegalArgumentException("Data must contain 'id' for update");
        }
        Object id = data.get("id");
        String sql = buildUpdateSQL(table, data) + " WHERE id = ?";

        try (Connection conn = DB.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            List<Object> params = new ArrayList<>(data.values());
            stmt.setObject(params.size(), id); // last param = id
            setParams(stmt, params.subList(0, params.size() - 1)); // rest
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                return new HashMap<>(data);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Collections.emptyMap();
    }

    public List<Map<String, Object>> updateList(String table, List<Map<String, Object>> dataList) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (dataList.isEmpty()) return result;

        try (Connection conn = DB.getConnection()) {
            conn.setAutoCommit(false);
            for (Map<String, Object> data : dataList) {
                if (!data.containsKey("id")) continue;
                Object id = data.get("id");
                String sql = buildUpdateSQL(table, data) + " WHERE id = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    List<Object> params = new ArrayList<>(data.values());
                    stmt.setObject(params.size(), id);
                    setParams(stmt, params.subList(0, params.size() - 1));
                    stmt.addBatch();
                    result.add(new HashMap<>(data));
                }
            }
            conn.commit();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return result;
    }

    // ---------------- DELETE ----------------
    public Map<String, Object> delete(String table, Object id) {
        String sql = "DELETE FROM \"" + table + "\" WHERE id = ?";
        try (Connection conn = DB.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, id);
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                return Map.of("id", id);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Collections.emptyMap();
    }

    public Map<String, Object> deleteList(String table, List<Object> ids) {
        Map<String, Object> result = new HashMap<>();
        if (ids.isEmpty()) return result;

        String sql = "DELETE FROM \"" + table + "\" WHERE id = ?";
        try (Connection conn = DB.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            for (Object id : ids) {
                stmt.setObject(1, id);
                stmt.addBatch();
                result.put(id.toString(), id);
            }
            stmt.executeBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return result;
    }

    // ---------------- HELPERS ----------------
    private String buildInsertSQL(String table, Map<String, Object> data) {
        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO ").append("\"").append(table).append("\"").append(" (");
        sb.append(data.keySet().stream().map(o -> "\"" + o + "\"").collect(Collectors.joining(",")));
        sb.append(") VALUES (");
        sb.append(String.join(", ", Collections.nCopies(data.size(), "?")));
        sb.append(")");
        return sb.toString();
    }

    private String buildUpdateSQL(String table, Map<String, Object> data) {
        StringBuilder sb = new StringBuilder();
        sb.append("UPDATE ").append("\"").append(table).append("\"").append(" SET ");
        sb.append(String.join(", ", data.keySet().stream().filter(k -> !k.equals("id"))
                .map(k -> k + " = ?").toList()));
        return sb.toString();
    }

    private void setParams(PreparedStatement stmt, List<Object> params) throws SQLException {
        for (int i = 0; i < params.size(); i++) {
            stmt.setObject(i + 1, params.get(i));
        }
    }
}
