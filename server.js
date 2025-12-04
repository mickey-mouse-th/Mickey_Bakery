import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "dpg-d4ol1ec9c44c73fidko0-a.oregon-postgres.render.com",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

const app = express();

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ ok: true, time: result.rows[0] });
});

app.listen(process.env.PORT || 10000, () =>
  console.log("Server running")
);
