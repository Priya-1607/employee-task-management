-- Schema for the persistent priority queue.
-- Run via: npm run setup

CREATE TABLE IF NOT EXISTS pq_items (
  id INTEGER PRIMARY KEY,
  priority INTEGER NOT NULL,
  value JSONB NOT NULL DEFAULT 'null'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pq_items_priority ON pq_items (priority);

CREATE TABLE IF NOT EXISTS pq_meta (
  key TEXT PRIMARY KEY,
  value BIGINT NOT NULL
);

INSERT INTO pq_meta (key, value)
VALUES ('next_id', 1)
ON CONFLICT (key) DO NOTHING;
