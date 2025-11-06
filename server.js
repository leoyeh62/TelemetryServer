import express from "express";
import pg from "pg";

const app = express();
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function setupDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      sessionId VARCHAR(255) NOT NULL,
      duration INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE OR REPLACE VIEW users_time AS
    SELECT userId, SUM(duration) AS total_duration
    FROM sessions
    GROUP BY userId
  `);
}
setupDB();

async function insertSession(userId, sessionId, duration) {
  if (duration < 60) return;
  await pool.query(
    "INSERT INTO sessions(user_id, session_id, duration) VALUES($1, $2, $3)",
    [userId, sessionId, duration]
  );
}

app.post("/session", (req, res) => {
  const { userId, sessionId, duration } = req.body;
  insertSession(userId, sessionId, duration);
  console.log("Session reçue :", JSON.stringify(req.body));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () =>
  console.log(`Serveur en écoute sur le port ${PORT}`)
);
