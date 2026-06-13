import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, 'wonder.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  share_code    TEXT UNIQUE NOT NULL,
  -- interest profile stored as JSON: { tags: { tagId: weight 0..3 }, dietary: [..], pace, social }
  profile       TEXT,
  -- default home location for convenience
  home_lat      REAL,
  home_lng      REAL,
  home_label    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS connections (
  id          TEXT PRIMARY KEY,
  user_a      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- relationship hint chosen by the requester: 'friend' | 'partner'
  relation    TEXT NOT NULL DEFAULT 'friend',
  status      TEXT NOT NULL DEFAULT 'accepted',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_a, user_b)
);

CREATE TABLE IF NOT EXISTS plans (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode        TEXT NOT NULL,
  title       TEXT NOT NULL,
  -- full request + the chosen itinerary stored as JSON
  request     TEXT NOT NULL,
  itinerary   TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plans_owner ON plans(owner_id);
CREATE INDEX IF NOT EXISTS idx_conn_a ON connections(user_a);
CREATE INDEX IF NOT EXISTS idx_conn_b ON connections(user_b);
`);

export default db;
