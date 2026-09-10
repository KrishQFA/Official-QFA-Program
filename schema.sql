-- Run this once via: npx wrangler d1 execute quote-builder-db --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  sourced_by TEXT,
  sourced_at INTEGER,
  priced_by TEXT,
  priced_at INTEGER,
  customer_currency TEXT,
  rates_json TEXT,
  items_json TEXT,
  assigned_to TEXT,
  created_at INTEGER,
  completed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
