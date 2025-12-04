// server.js
const express = require('express');
const cors = require('cors');
const pkg = require('pg');
const { Pool } = pkg;

// Load dotenv only for dev
const dotenv = require('dotenv');
if (process.env.NODE_ENV === "DEV") {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/api/query", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM test_users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(process.cwd() + "/public/index.html"));

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
