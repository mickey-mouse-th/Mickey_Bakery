package com.bakery.bakery;

import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

import com.bakery.bakery.util.DB;

class SelectExpr {
    String sql;
    SelectExpr(String sql) {
        this.sql = sql;
    }
}

class QTable {

    String tableName;
    String alias;

    String joinFkField;
    String joinPkField = "id";

    String lastIdField;
    String sortField;
    boolean sortDesc;

    List<String> fields = new ArrayList<>();
    Map<String, Object> filters = new LinkedHashMap<>();
    List<SelectExpr> aggregates = new ArrayList<>();
    List<Count> countList = new ArrayList<>();

    QTable(String tableName, int index) {
        this.tableName = tableName;
        this.alias = "t" + index;
    }

    public QTable joinOn(String fkField) {
        this.joinFkField = fkField;
        return this;
    }

    public QTable field(String expr) {
        fields.addAll(Arrays.stream(expr.split(","))
                .map(String::trim).toList());
        return this;
    }

    public QTable sort(String field) {
        this.sortField = field;
        this.sortDesc = false;
        return this;
    }

    public QTable sortD(String field) {
        this.sortField = field;
        this.sortDesc = true;
        return this;
    }

    public QTable lastIdField(String field) {
        this.lastIdField = field;
        return this;
    }

    public QTable filter(Object... kv) {
        if (kv.length % 2 != 0) {
            throw new IllegalArgumentException("filter ต้องเป็นคู่ field, value");
        }
        for (int i = 0; i < kv.length; i += 2) {
            filters.put((String) kv[i], kv[i + 1]);
        }
        return this;
    }

    public QTable filter(Map<String, Object> map) {
        filters.putAll(map);
        return this;
    }

    static class Count {
        String field;
        String prefix;
        List<Object> values;

        Count(String field, String prefix, List<Object> values) {
            this.field = field;
            this.prefix = prefix;
            this.values = values;
        }
    }

    public QTable count(String field, String prefix) {
        List<Object> vals = fetchDistinctValues(field);
        countList.add(new Count(field, prefix, vals));
        return this;
    }
    
    public QTable count(String field, List<Object> vals, String prefix) {
        countList.add(new Count(field, prefix, vals));
        return this;
    }

    private List<Object> fetchDistinctValues(String field) {
        List<Object> list = new ArrayList<>();
        String sql = "SELECT DISTINCT \"" + field + "\" FROM \"" + tableName + "\"";

        try (Connection conn = DB.getConnection(); PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(rs.getObject(1));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return list;
    }

    List<String> buildSelect(List<Object> params) {
        List<String> list = new ArrayList<>();

        for (SelectExpr e : aggregates) {
            list.add(e.sql);
        }

        for (Count c : countList) {
            String col = alias + ".\"" + c.field + "\"";

            for (Object v : c.values) {
                list.add(
                    "COUNT(CASE WHEN " + col + " = ? THEN 1 END) AS \"" +
                    c.prefix + "_" + v + "\""
                );
                params.add(v);
            }
        }

        for (String f : fields) {
            String[] s = f.split("\\s+");
            if (s.length == 1)
                list.add(alias + ".\"" + s[0] + "\"");
            else
                list.add(alias + ".\"" + s[0] + "\" AS \"" + s[1] + "\"");
        }

        return list;
    }

    String buildJoin(QTable prev) {
        if (prev == null) {
            return "FROM \"" + tableName + "\" " + alias;
        }
        return "JOIN \"" + tableName + "\" " + alias +
               " ON " + prev.alias + ".\"" + joinPkField + "\" = " +
               alias + ".\"" + joinFkField + "\"";
    }
}

public class QBakery {

    private final List<QTable> tables = new ArrayList<>();
    private final List<Object> params = new ArrayList<>();
    private final List<String> groupBy = new ArrayList<>();

    private Integer limit;
    private Object lastId;

    public boolean isDiag = false;

    public QTable addTable(String tableName) {
        QTable t = new QTable(tableName, tables.size() + 1);
        tables.add(t);
        return t;
    }

    public QBakery limit(int n) {
        this.limit = n;
        return this;
    }

    public QBakery lastId(Object id) {
        this.lastId = id;
        return this;
    }

    public QBakery groupBy(String... fields) {
        groupBy.addAll(Arrays.asList(fields));
        return this;
    }

    public List<Map<String, Object>> listData() {
        String sql = buildSQL();

        if (isDiag) {
            System.out.println("Executing SQL:\n" + sql);
            System.out.println("Params: " + params);
        }

        List<Map<String, Object>> result = new ArrayList<>();

        try (Connection conn = DB.getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                ResultSetMetaData meta = rs.getMetaData();
                int colCount = meta.getColumnCount();

                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= colCount; i++) {
                        row.put(meta.getColumnLabel(i), rs.getObject(i));
                    }
                    result.add(row);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return result;
    }

    private String buildSQL() {

        params.clear();
        StringBuilder sb = new StringBuilder();

        sb.append("SELECT ")
          .append(tables.stream()
                .flatMap(t -> t.buildSelect(params).stream())
                .collect(Collectors.joining(", ")));

        for (int i = 0; i < tables.size(); i++) {
            sb.append("\n")
              .append(tables.get(i)
                .buildJoin(i == 0 ? null : tables.get(i - 1)));
        }

        List<String> wheres = new ArrayList<>();

        if (lastId != null && tables.get(0).lastIdField != null) {
            wheres.add(tables.get(0).alias + ".\"" +
                       tables.get(0).lastIdField + "\" > ?");
            params.add(lastId);
        }

        for (QTable t : tables) {
            for (var e : t.filters.entrySet()) {
                wheres.add(parseFilter(t.alias, e.getKey(), e.getValue()));
            }
        }

        if (!wheres.isEmpty()) {
            sb.append("\nWHERE ").append(String.join(" AND ", wheres));
        }

        if (!groupBy.isEmpty()) {
            sb.append("\nGROUP BY ");
            sb.append(groupBy.stream()
                .map(this::resolveGroupByField)
                .collect(Collectors.joining(", ")));
        }

        List<String> orders = tables.stream()
            .filter(t -> t.sortField != null)
            .map(t -> t.alias + ".\"" + t.sortField + "\"" +
                    (t.sortDesc ? " desc" : ""))
            .toList();

        if (!orders.isEmpty()) {
            sb.append("\nORDER BY ").append(String.join(", ", orders));
        }

        if (limit != null) {
            sb.append("\nLIMIT ").append(limit);
        }

        return sb.toString();
    }

    private String resolveGroupByField(String name) {
        for (QTable t : tables) {
            for (String f : t.fields) {
                String[] s = f.split("\\s+");
                if (s.length == 2) {
                    String col = s[0];
                    String alias = s[1];
                    if (alias.equals(name)) {
                        return t.alias + ".\"" + col + "\"";
                    }
                }
            }
        }

        for (QTable t : tables) {
            for (String f : t.fields) {
                String col = f.split("\\s+")[0];
                if (col.equals(name)) {
                    return t.alias + ".\"" + col + "\"";
                }
            }
        }

        throw new IllegalArgumentException(
            "groupBy field not found (alias or column): " + name
        );
    }

    private String parseFilter(String alias, String field, Object expr) {

        if (expr instanceof String s) {

            if (s.startsWith("IN!")) {
                String[] vals = s.substring(3).split(",");
                params.addAll(Arrays.asList(vals));
                return alias + ".\"" + field + "\" IN (" +
                        String.join(",", Collections.nCopies(vals.length, "?")) + ")";
            }

            if (s.startsWith("LK!*")) {
                String v = s.substring(4);
                params.add("%" + v + "%");
                String realField = field.replace("_NAME", "name");
                return alias + ".\"" + realField + "\" LIKE ?";
            }
        }

        params.add(expr);
        return alias + ".\"" + field + "\" = ?";
    }
}
