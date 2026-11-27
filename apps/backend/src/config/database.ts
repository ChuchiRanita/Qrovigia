import Database from "better-sqlite3";
import path from "node:path";
import { mkdirSync } from "node:fs";

const databaseDirectory = path.resolve(__dirname, "../../../../data");
const databasePath =
  process.env.SQLITE_DATABASE_PATH ??
  path.join(databaseDirectory, "qro-sentinel.sqlite");

if (process.env.SQLITE_DATABASE_PATH === undefined) {
  mkdirSync(databaseDirectory, { recursive: true });
}

export const database = new Database(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    url TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL UNIQUE,
    environment TEXT NOT NULL CHECK (environment IN ('production', 'testing', 'development')),
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending_verification', 'active', 'paused', 'configuration_error')),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'error')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_scan_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites (created_at DESC);
`);
