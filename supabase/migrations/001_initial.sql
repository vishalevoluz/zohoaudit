-- Run this in your Supabase project → SQL Editor

-- MCP endpoint config (one row per integration key)
CREATE TABLE IF NOT EXISTS mcp_config (
  key        TEXT PRIMARY KEY,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mcp_config_updated_at
  BEFORE UPDATE ON mcp_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Scheduled audit reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id          TEXT PRIMARY KEY,
  name        TEXT        NOT NULL,
  frequency   TEXT        NOT NULL DEFAULT 'weekly',
  modules     JSONB       NOT NULL DEFAULT '[]',
  report_type TEXT        NOT NULL DEFAULT 'full-audit',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_run    TIMESTAMPTZ,
  next_run    TIMESTAMPTZ,
  status      TEXT        NOT NULL DEFAULT 'active'
);
