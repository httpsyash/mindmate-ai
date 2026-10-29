const path = require('path');
const fs = require('fs');
require('dotenv').config();

let adapter = null;

// Ensure data folder exists for SQLite fallback
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function initSqlite() {
  const { DatabaseSync } = require('node:sqlite');
  const dbFile = path.join(dataDir, 'mindmate.db');
  const sqlite = new DatabaseSync(dbFile);

  // Initialize SQLite schema
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      mobile TEXT UNIQUE,
      password_hash TEXT,
      avatar TEXT,
      google_id TEXT,
      is_verified INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      message TEXT NOT NULL,
      emotion TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS moods (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mood TEXT NOT NULL,
      note TEXT,
      recorded_at TEXT NOT NULL DEFAULT (DATE('now')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, recorded_at)
    );

    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      subjects TEXT NOT NULL DEFAULT '[]',
      available_hours_per_day REAL DEFAULT 2,
      deadline TEXT,
      preparation_level TEXT DEFAULT 'medium',
      schedule TEXT NOT NULL DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_moods_user ON moods(user_id);
    CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id);
  `);

  // Auto-migration for Gmail & Google Auth support
  try {
    const cols = sqlite.prepare("PRAGMA table_info(users)").all().map(c => c.name);
    if (!cols.includes('email')) {
      sqlite.exec("ALTER TABLE users ADD COLUMN email TEXT;");
      sqlite.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;");
    }
    if (!cols.includes('avatar')) {
      sqlite.exec("ALTER TABLE users ADD COLUMN avatar TEXT;");
    }
    if (!cols.includes('google_id')) {
      sqlite.exec("ALTER TABLE users ADD COLUMN google_id TEXT;");
    }
  } catch (migErr) {
    console.warn("Database migration note:", migErr.message);
  }

  console.log(`💾 Database: SQLite storage active (${dbFile})`);

  return {
    isSqlite: true,
    async query(text, params = []) {
      // Convert Postgres $1, $2, etc. to SQLite ?
      const sqliteText = text.replace(/\$\d+/g, '?');
      const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqliteText);
      const isReturning = /RETURNING/i.test(sqliteText);

      try {
        const stmt = sqlite.prepare(sqliteText);
        if (isSelect) {
          const rows = stmt.all(...params);
          return { rows };
        } else if (isReturning) {
          const rows = stmt.all(...params);
          return { rows };
        } else {
          const info = stmt.run(...params);
          return { rows: [], rowCount: info.changes };
        }
      } catch (err) {
        console.error('SQLite query error:', err.message, '\nSQL:', sqliteText);
        throw err;
      }
    },
  };
}

// PostgreSQL fallback wrapper
function createPgPool() {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mindmate_ai',
    connectionTimeoutMillis: 2000,
  });

  return {
    isSqlite: false,
    pool,
    async query(text, params = []) {
      return pool.query(text, params);
    },
  };
}

// Check if PostgreSQL is explicitly requested and running, else use SQLite
if (process.env.USE_POSTGRES === 'true') {
  try {
    adapter = createPgPool();
    console.log('🐘 PostgreSQL adapter selected');
  } catch (err) {
    console.warn('⚠️  Could not connect to PostgreSQL, falling back to SQLite:', err.message);
    adapter = initSqlite();
  }
} else {
  // Default to reliable zero-config SQLite
  adapter = initSqlite();
}

module.exports = {
  pool: adapter,
  query: (text, params) => adapter.query(text, params),
};
