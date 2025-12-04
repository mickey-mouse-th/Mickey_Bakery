import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

// -----------------------------------------------------
// Load dotenv only for local development
// -----------------------------------------------------
if (process.env.NODE_ENV === "DEV") {
  const dotenv = require("dotenv");
  dotenv.config();
}

// -----------------------------------------------------
// Express setup
// -----------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------------------
// PostgreSQL connection
// -----------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Test API
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Example query API
app.get("/api/query", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM test_users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// -----------------------------------------------------
// Serve static frontend (public folder)
// -----------------------------------------------------
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// -----------------------------------------------------
// Start server
// -----------------------------------------------------
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});