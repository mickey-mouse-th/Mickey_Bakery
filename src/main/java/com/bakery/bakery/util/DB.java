package com.bakery.bakery.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DB {

    public static Connection getConnection() throws SQLException {
        String url = System.getenv("DATABASE_URL");
        String user = System.getenv("DATABASE_USER");
        String password = System.getenv("DATABASE_PASSWORD");
        
        if (url == null || url.isEmpty()) {
            throw new RuntimeException("Environment variable DATABASE_URL not set");
        }
        if (user == null || user.isEmpty()) {
            throw new RuntimeException("Environment variable DATABASE_USER not set");
        }
        if (password == null) {
            throw new RuntimeException("Environment variable DATABASE_PASSWORD not set");
        }

        if (!url.contains("sslmode=")) {
            if (url.contains("?")) url += "&sslmode=require";
            else url += "?sslmode=require";
        }

        return DriverManager.getConnection(url, user, password);
    }
}
