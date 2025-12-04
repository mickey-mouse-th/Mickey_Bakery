if (process.env.NODE_ENV === "DEBUG") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Connect PostgreSQL Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// API test
app.get("/api/test", async (req, res) => {
  const rows = await pool.query("SELECT NOW()");
  res.json(rows.rows);
});

app.get("/api/test2", async (req, res) => {
  const rows = await pool.query("SELECT email FROM test_users");
  res.json(rows.rows);
});

// Serve frontend
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.get("/api/query", async (req, res) => {
  const rows = await pool.query("SELECT * FROM test_users;");
  res.json(rows.rows);
});

// Render uses PORT env
const port = process.env.PORT || 48531;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
