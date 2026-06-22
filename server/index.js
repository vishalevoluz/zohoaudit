// ─── CRM Audit Studio · Express backend (MCP-only) ───────────────────────────
// All Zoho CRM data is fetched via Zoho MCP through the Anthropic API.
// Storage is handled by server/db.js (Supabase or local file fallback).

const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const Anthropic  = require('@anthropic-ai/sdk');
const db        = require('./db');
const { getModuleAuditPrompt } = require('./prompts');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { PORT = 3001, ANTHROPIC_API_KEY } = process.env;

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ── Anthropic / MCP helpers ───────────────────────────────────────────────────
function getClient() {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set in .env');
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

async function callMCP(userPrompt, { maxTokens = 8192, system } = {}) {
  const mcpUrl = await db.getMcpUrl();
  if (!mcpUrl) throw new Error('Zoho MCP not configured — paste your MCP URL in the app.');

  const response = await getClient().beta.messages.create(
    {
      model:       'claude-sonnet-4-6',
      max_tokens:  maxTokens,
      system:      system || 'You are a JSON API. Use the available CRM tools to fetch data, then respond with ONLY valid JSON — no prose, no markdown fences, no explanation.',
      mcp_servers: [{ type: 'url', url: mcpUrl, name: 'zoho-crm' }],
      messages:    [{ role: 'user', content: userPrompt }],
    },
    { headers: { 'anthropic-beta': 'mcp-client-2025-04-04' } }
  );

  const text  = (response.content || []).find(b => b.type === 'text')?.text || '';
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('MCP returned no parseable JSON');
  return JSON.parse(match[0]);
}

// ── Auth: status ─────────────────────────────────────────────────────────────
app.get('/api/auth/status', async (req, res) => {
  try {
    const mcpUrl    = await db.getMcpUrl();
    const connected = !!(mcpUrl && ANTHROPIC_API_KEY);
    res.json({
      connected,
      org: connected ? { company_name: 'Zoho CRM (via MCP)', primary_email: '' } : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Auth: disconnect ─────────────────────────────────────────────────────────
app.post('/api/auth/disconnect', async (req, res) => {
  try {
    await db.deleteMcpUrl();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── MCP: save Zoho MCP URL ───────────────────────────────────────────────────
app.post('/api/mcp/configure', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'A valid URL is required' });
  }
  try {
    await db.setMcpUrl(url);
    console.log('[mcp/configure] saved URL');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Modules ───────────────────────────────────────────────────────────────────
app.get('/api/zoho/modules', async (req, res) => {
  try {
    const data = await callMCP(
      'Call ZohoCRM_getModules to list all CRM modules. ' +
      'Return JSON: {"modules":[{"api_name":"Leads","plural_label":"Leads","fields_count":0,"status":"visible"},...]}'
    );
    console.log('[modules via MCP] count:', data.modules?.length ?? '?');
    res.json(data);
  } catch (err) {
    console.error('[GET /modules]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Workflows — list ─────────────────────────────────────────────────────────
app.get('/api/zoho/workflows', async (req, res) => {
  try {
    const data = await callMCP(
      'Call ZohoCRM_getWorkflowRules with per_page=200. ' +
      'Return JSON: {"workflow_rules":[{"id":"...","name":"...","module":{"api_name":"Leads"},"trigger_type":"create","status":"Active","last_executed_time":"2026-01-01T00:00:00+05:30","actions":[]},...]}'
      , { maxTokens: 16384 }
    );
    console.log('[workflows via MCP] count:', data.workflow_rules?.length ?? '?');
    res.json(data);
  } catch (err) {
    console.error('[GET /workflows]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Workflows — create / delete (read-only MCP) ───────────────────────────────
app.post('/api/zoho/workflows', (req, res) =>
  res.status(501).json({ error: 'MCP mode is read-only. Create workflows directly in Zoho CRM.' })
);
app.delete('/api/zoho/workflows/:id', (req, res) =>
  res.status(501).json({ error: 'MCP mode is read-only. Delete workflows directly in Zoho CRM.' })
);

// ── Workflow — usage ──────────────────────────────────────────────────────────
app.get('/api/zoho/workflows/:id/usage', async (req, res) => {
  const { id } = req.params;
  const { from, till } = req.query;
  try {
    const fromClause = from ? ` executed_from="${from}"` : '';
    const tillClause = till ? ` executed_till="${till}"` : '';
    const data = await callMCP(
      `Call ZohoCRM_getWorkflowRuleUsage with workflowRuleId="${id}"${fromClause}${tillClause}. ` +
      'Return the tool response as-is as JSON.'
    );
    console.log(`[workflow usage:${id}]`);
    res.json(data);
  } catch (err) {
    console.error('[GET /workflows/:id/usage]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Fields — list ─────────────────────────────────────────────────────────────
app.get('/api/zoho/fields', async (req, res) => {
  const { module = 'Leads' } = req.query;
  try {
    const data = await callMCP(
      `Call ZohoCRM_getFields with module="${module}" and include="allowed_permissions_to_update". ` +
      'Return JSON: {"fields":[{"api_name":"Last_Name","field_label":"Last Name","data_type":"text","mandatory":true,"custom_field":false,"tooltip":{"name":""}},...]}'
      , { maxTokens: 16384 }
    );
    console.log(`[fields:${module} via MCP] count:`, data.fields?.length ?? '?');
    res.json(data);
  } catch (err) {
    console.error(`[GET /fields?module=${module}]`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Fields — create / delete (read-only MCP) ──────────────────────────────────
app.post('/api/zoho/fields', (req, res) =>
  res.status(501).json({ error: 'MCP mode is read-only. Create fields directly in Zoho CRM.' })
);
app.delete('/api/zoho/fields/:apiName', (req, res) =>
  res.status(501).json({ error: 'MCP mode is read-only. Delete fields directly in Zoho CRM.' })
);

// ── Functions (automation tasks via ZohoCRM_getWorkflowTasks) ─────────────────
app.get('/api/zoho/functions', async (req, res) => {
  const { type } = req.query;
  try {
    const typeClause = type ? ` with feature_type="${type}"` : '';
    const data = await callMCP(
      `Call ZohoCRM_getWorkflowTasks${typeClause} and per_page=200. ` +
      'Return JSON: {"functions":[{"id":"...","display_name":"taskName","module":{"api_name":"Leads"},"status":"active","type":"workflow"},...]}'
      , { maxTokens: 16384 }
    );
    console.log('[functions via MCP] count:', data.functions?.length ?? '?');
    res.json(data);
  } catch (err) {
    console.error('[GET /functions]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Roles ─────────────────────────────────────────────────────────────────────
app.get('/api/zoho/roles', async (req, res) => {
  try {
    const data = await callMCP(
      'Call ZohoCRM_getFeatureDetails or ZohoCRM_getModuleAssignedUsers to get CRM role/user info. ' +
      'Return JSON: {"roles":[{"id":"...","name":"Admin","share_data_with_peers":false},...]} '
    );
    res.json(data);
  } catch (err) {
    console.error('[GET /roles]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Blueprints ────────────────────────────────────────────────────────────────
app.get('/api/zoho/blueprints/:module', async (req, res) => {
  const { module } = req.params;
  try {
    const data = await callMCP(
      `Call ZohoCRM_getRecordBlueprintTransition or a suitable tool to get blueprint/process info for the ${module} module. ` +
      'Return the response as JSON.'
    );
    res.json(data);
  } catch (err) {
    console.error('[GET /blueprints/:module]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Zia — chat with live CRM context via MCP ─────────────────────────────────
app.post('/api/zoho/zia/ask', async (req, res) => {
  const { query, chat_history = [] } = req.body;
  try {
    const mcpUrl   = await db.getMcpUrl();
    const messages = [
      ...chat_history.map(m => ({
        role:    m.role === 'zia' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: query },
    ];
    const system =
      'You are Zia, a Zoho CRM expert assistant with live access to CRM data via MCP tools. ' +
      'Use the tools when you need to look up real data. ' +
      'Answer questions about CRM configuration, workflows, fields, and best practices concisely.';

    let response;
    if (mcpUrl) {
      response = await getClient().beta.messages.create(
        {
          model:       'claude-sonnet-4-6',
          max_tokens:  4096,
          system,
          mcp_servers: [{ type: 'url', url: mcpUrl, name: 'zoho-crm' }],
          messages,
        },
        { headers: { 'anthropic-beta': 'mcp-client-2025-04-04' } }
      );
    } else {
      response = await getClient().messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 4096, system, messages,
      });
    }

    const text = (response.content || []).find(b => b.type === 'text')?.text || '';
    res.json({ assistant: { response: text } });
  } catch (err) {
    console.error('[POST /zia/ask]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Module Audit via Claude + Zoho MCP ───────────────────────────────────────
app.post('/api/audit/modules', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env' });
  }
  const mcpUrl = await db.getMcpUrl();
  if (!mcpUrl) {
    return res.status(500).json({ error: 'Zoho MCP not configured — paste your MCP URL in the app.' });
  }
  try {
    console.log('[audit/modules] fetching modules via MCP');
    const modulesData = await callMCP(
      'Use ZohoCRM_getModules to fetch all CRM modules. Return the full modules array as JSON.'
    );

    console.log('[audit/modules] running audit with', (modulesData.modules || modulesData).length, 'modules');
    const prompt = getModuleAuditPrompt(modulesData);
    const response = await getClient().messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 8192,
      system:     'You are a JSON API. Respond with ONLY valid JSON — no prose, no markdown fences.',
      messages:   [{ role: 'user', content: prompt }],
    });

    const text = (response.content || []).find(b => b.type === 'text')?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Audit returned no parseable JSON');
    const report = JSON.parse(match[0]);

    console.log('[audit/modules] done —', report.findings?.length, 'findings, health score:', report.summary?.overallHealthScore);
    res.json({ ok: true, report, usedMcp: true });
  } catch (err) {
    console.error('[audit/modules]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Scheduled Reports ─────────────────────────────────────────────────────────
function computeNextRun(frequency) {
  const d = new Date();
  if (frequency === 'daily')        d.setDate(d.getDate() + 1);
  else if (frequency === 'weekly')  d.setDate(d.getDate() + 7);
  else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

app.get('/api/scheduled-reports', async (req, res) => {
  try {
    const reports = await db.getReports();
    res.json({ reports });
  } catch (err) {
    console.error('[GET /scheduled-reports]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scheduled-reports', async (req, res) => {
  const { name, frequency, modules, reportType } = req.body;
  const report = {
    id:         Date.now().toString(),
    name:       name || 'CRM Audit Report',
    frequency:  frequency || 'weekly',
    modules:    Array.isArray(modules) ? modules : [],
    reportType: reportType || 'full-audit',
    createdAt:  new Date().toISOString(),
    lastRun:    null,
    nextRun:    computeNextRun(frequency || 'weekly'),
    status:     'active',
  };
  try {
    const saved = await db.createReport(report);
    res.json({ report: saved });
  } catch (err) {
    console.error('[POST /scheduled-reports]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/scheduled-reports/:id', async (req, res) => {
  try {
    const deleted = await db.deleteReport(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /scheduled-reports/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scheduled-reports/:id/run', async (req, res) => {
  try {
    const reports = await db.getReports();
    const existing = reports.find(r => r.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const updated = await db.updateReport(req.params.id, {
      lastRun: new Date().toISOString(),
      nextRun: computeNextRun(existing.frequency),
    });
    res.json({ ok: true, report: updated });
  } catch (err) {
    console.error('[POST /scheduled-reports/:id/run]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Crash guards ──────────────────────────────────────────────────────────────
process.on('uncaughtException',  err => console.error('[uncaughtException]',  err.message));
process.on('unhandledRejection', err => console.error('[unhandledRejection]', err?.message || err));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[server] http://localhost:${PORT}`);
  const mcpUrl = await db.getMcpUrl();
  console.log('[server] Zoho MCP:', mcpUrl ? 'configured ✓' : 'NOT configured — paste URL in app');
  console.log('[server] Storage:', db.isSupabaseEnabled() ? 'Supabase ✓' : 'Local files (set SUPABASE_URL + SUPABASE_ANON_KEY to enable)');
  if (!ANTHROPIC_API_KEY) console.warn('[server] ⚠  ANTHROPIC_API_KEY not set in .env');
});
