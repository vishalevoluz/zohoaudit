// ─── CRM Audit Studio · Storage layer ────────────────────────────────────────
// Uses Supabase when SUPABASE_URL + SUPABASE_ANON_KEY are configured,
// otherwise falls back to local JSON files (dev / no-Supabase mode).

const fs   = require('fs');
const path = require('path');

const MCP_FILE     = path.join(__dirname, '../.mcp.json');
const REPORTS_FILE = path.join(__dirname, '../.scheduled-reports.json');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

const PLACEHOLDER = 'https://your-project.supabase.co';
const supabase = (SUPABASE_URL && SUPABASE_URL !== PLACEHOLDER && SUPABASE_ANON_KEY)
  ? require('@supabase/supabase-js').createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ── MCP config ────────────────────────────────────────────────────────────────

async function getMcpUrl() {
  if (supabase) {
    const { data } = await supabase
      .from('mcp_config')
      .select('url')
      .eq('key', 'zoho-crm')
      .maybeSingle();
    return data?.url || null;
  }
  if (!fs.existsSync(MCP_FILE)) return null;
  try {
    const raw = fs.readFileSync(MCP_FILE, 'utf8').replace(/^﻿/, '');
    return JSON.parse(raw)?.mcpServers?.['zoho-crm']?.url || null;
  } catch { return null; }
}

async function setMcpUrl(url) {
  if (supabase) {
    await supabase
      .from('mcp_config')
      .upsert({ key: 'zoho-crm', url }, { onConflict: 'key' });
    return;
  }
  let existing = {};
  if (fs.existsSync(MCP_FILE)) {
    try { existing = JSON.parse(fs.readFileSync(MCP_FILE, 'utf8')); } catch {}
  }
  const config = {
    ...existing,
    mcpServers: { ...(existing.mcpServers || {}), 'zoho-crm': { type: 'http', url } },
  };
  fs.writeFileSync(MCP_FILE, JSON.stringify(config, null, 2));
}

async function deleteMcpUrl() {
  if (supabase) {
    await supabase.from('mcp_config').delete().eq('key', 'zoho-crm');
    return;
  }
  if (!fs.existsSync(MCP_FILE)) return;
  try {
    const cfg = JSON.parse(fs.readFileSync(MCP_FILE, 'utf8'));
    if (cfg.mcpServers) delete cfg.mcpServers['zoho-crm'];
    fs.writeFileSync(MCP_FILE, JSON.stringify(cfg, null, 2));
  } catch {}
}

// ── Scheduled reports ─────────────────────────────────────────────────────────

function reportToDb(r) {
  const out = {};
  if (r.id        !== undefined) out.id          = r.id;
  if (r.name      !== undefined) out.name        = r.name;
  if (r.frequency !== undefined) out.frequency   = r.frequency;
  if (r.modules   !== undefined) out.modules     = r.modules;
  if (r.reportType !== undefined) out.report_type = r.reportType;
  if (r.createdAt !== undefined) out.created_at  = r.createdAt;
  if (r.lastRun   !== undefined) out.last_run    = r.lastRun;
  if (r.nextRun   !== undefined) out.next_run    = r.nextRun;
  if (r.status    !== undefined) out.status      = r.status;
  return out;
}

function dbToReport(r) {
  return {
    id:         r.id,
    name:       r.name,
    frequency:  r.frequency,
    modules:    r.modules,
    reportType: r.report_type,
    createdAt:  r.created_at,
    lastRun:    r.last_run,
    nextRun:    r.next_run,
    status:     r.status,
  };
}

function readReportsFile() {
  if (!fs.existsSync(REPORTS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8')); } catch { return []; }
}

function writeReportsFile(reports) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
}

async function getReports() {
  if (supabase) {
    const { data } = await supabase
      .from('scheduled_reports')
      .select('*')
      .order('created_at', { ascending: true });
    return (data || []).map(dbToReport);
  }
  return readReportsFile();
}

async function createReport(report) {
  if (supabase) {
    const { data } = await supabase
      .from('scheduled_reports')
      .insert(reportToDb(report))
      .select()
      .single();
    return dbToReport(data);
  }
  const reports = readReportsFile();
  reports.push(report);
  writeReportsFile(reports);
  return report;
}

async function updateReport(id, updates) {
  if (supabase) {
    const { data } = await supabase
      .from('scheduled_reports')
      .update(reportToDb(updates))
      .eq('id', id)
      .select()
      .single();
    return data ? dbToReport(data) : null;
  }
  const reports = readReportsFile();
  const idx = reports.findIndex(r => r.id === id);
  if (idx === -1) return null;
  reports[idx] = { ...reports[idx], ...updates };
  writeReportsFile(reports);
  return reports[idx];
}

async function deleteReport(id) {
  if (supabase) {
    const { error } = await supabase.from('scheduled_reports').delete().eq('id', id);
    return !error;
  }
  const reports = readReportsFile();
  const filtered = reports.filter(r => r.id !== id);
  if (filtered.length === reports.length) return false;
  writeReportsFile(filtered);
  return true;
}

module.exports = {
  getMcpUrl, setMcpUrl, deleteMcpUrl,
  getReports, createReport, updateReport, deleteReport,
  isSupabaseEnabled: () => !!supabase,
};
