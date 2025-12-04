import express from "express";
import cors from "cors";
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/test", async (req, res) => {
  res.json({ message: "Server is running! TEST" });
});

app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM test_users");
  res.json(result.rows);
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on " + port));
