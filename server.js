const express = require('express');
const cors = require('cors');
const pkg = require('pg');
const { Pool } = pkg;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (process.env.NODE_ENV === "DEV") {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const userResult = await pool.query('SELECT * FROM test_users WHERE email=$1', [email]);
  const user = userResult.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!user || !valid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await pool.query(
    'INSERT INTO "RefreshToken" ("token", "userId", "expTs") VALUES ($1, $2, $3)',
    [refreshToken, user.id, expiresAt]
  );
  res.json({ accessToken, refreshToken });
});

app.post('/api/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const tokenResult = await pool.query(
    'SELECT * FROM "RefreshToken" WHERE "token"=$1',
    [token]
  );
  const dbToken = tokenResult.rows[0];
  if (!dbToken) return res.status(403).json({ error: 'Invalid refresh token' });

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token expired' });

    const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  });
});

app.post('/api/logout', async (req, res) => {
  const { token } = req.body;
  if (token) {
    await pool.query('DELETE FROM "RefreshToken" WHERE "token"=$1', [token]);
  }
  res.json({ message: 'Logged out' });
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await pool.query('SELECT id FROM test_users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO test_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, password_hash, name]
    );

    res.status(201).json({ message: 'User created', user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/test', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json(result.rows);
});

app.get('/api/query', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM test_users');
  res.json(result.rows);
});

app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(process.cwd() + "/public/index.html"));

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
