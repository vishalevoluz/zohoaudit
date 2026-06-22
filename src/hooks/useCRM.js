// ─── CRM Audit Studio · useCRM hook ──────────────────────────────────────────
// Single source of truth for all app state. Spread onto page components.

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  MODULES, WORKFLOWS, FIELDS, FUNCTIONS,
  AUDIT_ISSUES, PICKLIST_DEAL_STAGE, PICKLIST_LEAD_SOURCE,
  WORKFLOW_STEPS, RECENT_CHANGES, HEALTH_METRICS,
  ROLES, ROLE_MATRIX,
} from "../data/crmData";

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

// ── Zoho API response → app data model ─────────────────────────────────────

const MODULE_ICONS = {
  Leads: "user-search", Contacts: "address-book", Deals: "currency-dollar",
  Accounts: "building", Activities: "calendar", Campaigns: "speakerphone",
  Cases: "ticket", Tasks: "check", Products: "package", Quotes: "receipt",
};

function transformModules(items) {
  return items.map(m => ({
    id:        m.api_name.toLowerCase(),
    name:      m.plural_label,
    icon:      MODULE_ICONS[m.api_name] || "box",
    color:     "#F1EFE8",
    textColor: "#444441",
    fields:    m.fields_count || 0,
    workflows: 0,
    functions: 0,
    health:    m.status === "visible" ? "good" : "warning",
  }));
}

const FIELD_TYPE_MAP = {
  text: "Text", textarea: "Long Text", integer: "Number", double: "Decimal",
  currency: "Currency", date: "Date", datetime: "Datetime", boolean: "Checkbox",
  picklist: "Picklist", multiselectpicklist: "Multi-Select", lookup: "Lookup",
  formula: "Formula", email: "Email", phone: "Phone", website: "URL",
  image: "Image", file: "File", autonumber: "Auto Number",
};

function transformFields(items, moduleName) {
  return items.map(f => ({
    id:         f.api_name,
    name:       f.field_label,
    module:     moduleName,
    type:       FIELD_TYPE_MAP[f.data_type] || f.data_type,
    required:   f.mandatory || false,
    documented: f.tooltip?.name ? "yes" : "no",
  }));
}

function transformWorkflows(items) {
  return items.map(r => ({
    id:      r.id,
    name:    r.name,
    module:  r.module?.api_name || r.module || "—",
    trigger: r.trigger_type || r.execute_on?.[0] || "record_action",
    steps:   (r.actions?.length || 0) + 1,
    lastRun: r.last_executed_time || "—",
    status:  r.status === "Active" ? "active" : "inactive",
  }));
}

const FUNC_TYPE_LABEL = {
  standalone:    "Standalone",
  workflow:      "Workflow",
  automation:    "Automation",
  custom_button: "Custom Button",
  related_list:  "Related List",
  connect:       "Connect",
};

function transformFunctions(items) {
  return items.map(f => ({
    id:       f.id,
    name:     f.display_name || f.function_name || f.name,
    module:   f.module?.api_name || f.module || "—",
    lang:     (f.source || "").toLowerCase().includes("deluge") ? "Deluge"
              : (f.source || "").toLowerCase().includes("js") ? "JavaScript"
              : "API",
    calledBy: 0,
    lastRun:  "—",
    status:   f.status === "active" ? "ok" : "warning",
    type:     f.type || f.category || "standalone",
    typeLabel: FUNC_TYPE_LABEL[f.type || f.category] || "Standalone",
  }));
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useCRM() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [authStatus, setAuthStatus] = useState({ connected: false, loading: true, org: null, error: null });
  const [dataLoading, setDataLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ active: false, done: { modules: false, workflows: false, fields: false, functions: false } });

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activePage, setActivePage] = useState("overview");

  // ── Modal ──────────────────────────────────────────────────────────────────
  const [modalType, setModalType] = useState(null);
  const openModal  = (type) => setModalType(type);
  const closeModal = ()     => setModalType(null);

  // ── Search ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ── CRM data (starts from seed, replaced with real Zoho data when connected)
  const [modules,   setModules]   = useState(MODULES);
  const [workflows, setWorkflows] = useState(WORKFLOWS);
  const [fields,    setFields]    = useState(FIELDS);
  const [functions, setFunctions] = useState(FUNCTIONS);
  const [issues,    setIssues]    = useState(AUDIT_ISSUES);
  const [dealStage, setDealStage] = useState(PICKLIST_DEAL_STAGE);
  const [leadSource]              = useState(PICKLIST_LEAD_SOURCE);

  // ── Field module selector — default matches seed data module ──────────────
  const [selectedModule, setSelectedModule] = useState("Deals");
  const [fieldsLoading,  setFieldsLoading]  = useState(false);

  // ── Zia chat ───────────────────────────────────────────────────────────────
  const [ziaMessages, setZiaMessages] = useState([]);
  const [ziaLoading,  setZiaLoading]  = useState(false);

  // ── Scheduled Reports ──────────────────────────────────────────────────────
  const [scheduledReports, setScheduledReports] = useState([]);

  // ── Load scheduled reports ─────────────────────────────────────────────────
  const loadScheduledReports = useCallback(async () => {
    try {
      const res = await fetch("/api/scheduled-reports");
      const data = await res.json();
      setScheduledReports(data.reports || []);
    } catch (err) {
      console.error("loadScheduledReports error:", err);
    }
  }, []);

  // ── Load fields for a specific module ─────────────────────────────────────
  const loadFieldsForModule = useCallback(async (module) => {
    setFieldsLoading(true);
    try {
      const res = await fetch(`/api/zoho/fields?module=${encodeURIComponent(module)}`).then(r => r.json());
      const flds = res?.fields ?? res?.data;
      if (Array.isArray(flds)) {
        setFields(transformFields(flds, module));
      }
    } catch (err) {
      console.error("loadFieldsForModule error:", err);
    } finally {
      setFieldsLoading(false);
    }
  }, []);

  // ── Load all data from Zoho (non-blocking — seed data stays visible) ────────
  const loadZohoData = useCallback(async () => {
    setDataLoading(true);
    setSyncProgress({ active: true, done: { modules: false, workflows: false, fields: false, functions: false } });

    const markDone = (key) =>
      setSyncProgress(p => ({ ...p, done: { ...p.done, [key]: true } }));

    try {
      const [modsRes, wfsRes, fieldsRes, fnsRes] = await Promise.allSettled([
        fetch("/api/zoho/modules").then(r => r.json()).then(d => { markDone("modules"); return d; }),
        fetch("/api/zoho/workflows").then(r => r.json()).then(d => { markDone("workflows"); return d; }),
        fetch("/api/zoho/fields?module=Deals").then(r => r.json()).then(d => { markDone("fields"); return d; }),
        fetch("/api/zoho/functions").then(r => r.json()).then(d => { markDone("functions"); return d; }),
      ]);

      if (modsRes.status === "fulfilled") {
        const mods = modsRes.value?.modules ?? modsRes.value?.data;
        if (Array.isArray(mods) && mods.length > 0) setModules(transformModules(mods));
      }
      if (wfsRes.status === "fulfilled") {
        const wfs = wfsRes.value?.workflow_rules ?? wfsRes.value?.data;
        if (Array.isArray(wfs) && wfs.length > 0) setWorkflows(transformWorkflows(wfs));
      }
      if (fieldsRes.status === "fulfilled") {
        const flds = fieldsRes.value?.fields ?? fieldsRes.value?.data;
        if (Array.isArray(flds) && flds.length > 0) setFields(transformFields(flds, "Deals"));
      }
      if (fnsRes.status === "fulfilled") {
        const fns = fnsRes.value?.functions ?? fnsRes.value?.data;
        if (Array.isArray(fns) && fns.length > 0) setFunctions(transformFunctions(fns));
      }
    } catch (err) {
      console.error("loadZohoData error:", err);
    } finally {
      setDataLoading(false);
      setSyncProgress(p => ({ ...p, active: false }));
    }
  }, []);

  // ── Check auth on mount; detect ?connected=true / ?auth_error=... ──────────
  useEffect(() => {
    const url = new URL(window.location.href);
    const connected  = url.searchParams.get("connected");
    const authError  = url.searchParams.get("auth_error");

    if (connected || authError) {
      window.history.replaceState({}, "", "/");
    }

    async function checkAuth() {
      try {
        const res  = await fetch("/api/auth/status");
        const data = await res.json();
        setAuthStatus({
          connected: data.connected,
          loading:   false,
          org:       data.org || null,
          error:     authError ? decodeURIComponent(authError) : null,
        });
        if (data.connected) { loadZohoData(); loadScheduledReports(); }
      } catch {
        setAuthStatus({
          connected: false,
          loading:   false,
          org:       null,
          error:     authError || "server_unreachable",
        });
      }
    }

    checkAuth();
  }, [loadZohoData]);

  // ── Disconnect from Zoho ───────────────────────────────────────────────────
  async function disconnect() {
    await fetch("/api/auth/disconnect", { method: "POST" });
    setAuthStatus({ connected: false, loading: false, org: null, error: null });
    setModules(MODULES);
    setWorkflows(WORKFLOWS);
    setFields(FIELDS);
    setFunctions(FUNCTIONS);
  }

  // ── CRUD helpers ───────────────────────────────────────────────────────────
  function addModule(data) {
    setModules(prev => [...prev, {
      id:        data.name.toLowerCase().replace(/\s+/g, "-"),
      name:      data.name,
      icon:      data.icon || "box",
      color:     "#F1EFE8",
      textColor: "#444441",
      fields:    0,
      workflows: 0,
      functions: 0,
      health:    "good",
    }]);
  }

  async function addWorkflow(data) {
    // Optimistic local add
    const tempId = "wf_" + uid();
    const newWf = {
      id:      tempId,
      name:    data.name,
      module:  data.module,
      trigger: data.trigger,
      steps:   1,
      lastRun: "—",
      status:  "active",
    };
    setWorkflows(prev => [...prev, newWf]);

    try {
      const res = await fetch("/api/zoho/workflows", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      }).then(r => r.json());

      // Replace temp ID with real Zoho ID if available
      const realId = res.workflow_rules?.[0]?.details?.id;
      if (realId) {
        setWorkflows(prev => prev.map(w => w.id === tempId ? { ...w, id: realId } : w));
      }
    } catch (err) {
      console.error("addWorkflow API error:", err);
    }
  }

  async function deleteWorkflow(id) {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    try {
      await fetch(`/api/zoho/workflows/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("deleteWorkflow API error:", err);
    }
  }

  async function addField(data) {
    const tempId = "f_" + uid();
    const newField = {
      id:         tempId,
      name:       data.name,
      module:     data.module,
      type:       data.type,
      required:   data.required === "Yes",
      documented: "no",
    };
    setFields(prev => [...prev, newField]);
    setModules(prev => prev.map(m =>
      m.name === data.module ? { ...m, fields: m.fields + 1 } : m
    ));

    try {
      const res = await fetch("/api/zoho/fields", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      }).then(r => r.json());

      const realApiName = res.fields?.[0]?.details?.api_name;
      if (realApiName) {
        setFields(prev => prev.map(f => f.id === tempId ? { ...f, id: realApiName } : f));
      }
    } catch (err) {
      console.error("addField API error:", err);
    }
  }

  async function deleteField(id, module) {
    setFields(prev => prev.filter(f => f.id !== id));
    setModules(prev => prev.map(m =>
      m.name === module ? { ...m, fields: Math.max(0, m.fields - 1) } : m
    ));
    try {
      await fetch(`/api/zoho/fields/${encodeURIComponent(id)}?module=${encodeURIComponent(module)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("deleteField API error:", err);
    }
  }

  function addFunction(data) {
    setFunctions(prev => [...prev, {
      id:       "fn_" + uid(),
      name:     data.name.endsWith("()") ? data.name : data.name + "()",
      module:   data.module,
      lang:     data.lang,
      calledBy: 0,
      lastRun:  "—",
      status:   "ok",
    }]);
  }

  function addOption(data) {
    const option = {
      label:  data.label,
      value:  data.label.replace(/\s+/g, "_"),
      prob:   data.prob  ? parseInt(data.prob)  : null,
      order:  data.order ? parseInt(data.order) : null,
      status: "active",
    };
    if (data.field === "Deal Stage") setDealStage(prev => [...prev, option]);
  }

  async function fetchFunctionsByType(type) {
    const url = type ? `/api/zoho/functions?type=${encodeURIComponent(type)}` : "/api/zoho/functions";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
    const raw = data?.functions ?? data?.data ?? [];
    return Array.isArray(raw) ? transformFunctions(raw) : [];
  }

  async function createScheduledReport(formData) {
    const res = await fetch("/api/scheduled-reports", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.report) setScheduledReports(prev => [...prev, data.report]);
  }

  async function deleteScheduledReport(id) {
    setScheduledReports(prev => prev.filter(r => r.id !== id));
    await fetch(`/api/scheduled-reports/${id}`, { method: "DELETE" });
  }

  async function runScheduledReport(id) {
    const res = await fetch(`/api/scheduled-reports/${id}/run`, { method: "POST" });
    const data = await res.json();
    if (data.report) {
      setScheduledReports(prev => prev.map(r => r.id === id ? data.report : r));
    }
  }

  async function fetchWorkflowUsage(workflowId, from, till) {
    const res = await fetch(
      `/api/zoho/workflows/${encodeURIComponent(workflowId)}/usage?from=${from}&till=${till}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function resolveIssue(id) {
    setIssues(prev => prev.filter(i => i.id !== id));
  }

  // ── Zia chat ───────────────────────────────────────────────────────────────
  async function sendZiaMessage(text) {
    const userMsg = { role: "user", content: text, ts: Date.now() };

    // Build chat_history from existing messages in Zoho's role format (zia → assistant)
    setZiaMessages(prev => {
      const history = prev.map(m => ({
        role:    m.role === "zia" ? "assistant" : "user",
        content: m.content,
      }));

      fetch("/api/zoho/zia/ask", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: text, chat_history: history }),
      })
        .then(r => r.json())
        .then(res => {
          const reply =
            res.assistant?.response ||
            res.assistant?.content ||
            res.response ||
            (res.error ? `Zia error: ${JSON.stringify(res.error)}` : JSON.stringify(res, null, 2));

          setZiaMessages(msgs => [...msgs, { role: "zia", content: reply, ts: Date.now() }]);
        })
        .catch(err => {
          setZiaMessages(msgs => [...msgs, { role: "zia", content: `Error: ${err.message}`, ts: Date.now() }]);
        })
        .finally(() => setZiaLoading(false));

      return [...prev, userMsg];
    });

    setZiaLoading(true);
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const auditScore = useMemo(() => {
    const totalChecks  = 48;
    const passedChecks = totalChecks - issues.length;
    return Math.round((passedChecks / totalChecks) * 100);
  }, [issues]);

  const counts = useMemo(() => ({
    modules:      modules.length,
    workflows:    workflows.length,
    fields:       fields.length,
    functions:    functions.length,
    issues:       issues.length,
    inactive:     workflows.filter(w => w.status === "inactive").length,
    errors:       functions.filter(f => f.status === "error").length,
    unused:       functions.filter(f => f.status === "unused").length,
    undocumented: fields.filter(f => f.documented === "no").length,
  }), [modules, workflows, fields, functions, issues]);

  const passedChecks = [
    "All required fields present",
    "No circular workflow dependencies",
    "Role permissions configured",
    "Data retention policy active",
    "GDPR consent fields exist",
    "Duplicate detection enabled",
    "Field-level security set",
    "Audit trail logging on",
    "API rate limits configured",
    "Webhook endpoints responding",
    "Backup schedule active",
  ];

  return {
    // auth
    authStatus, dataLoading, syncProgress, disconnect,

    // navigation
    activePage, setActivePage,

    // modal
    modalType, openModal, closeModal,

    // search
    searchQuery, setSearchQuery,

    // data
    modules, workflows, fields, functions, auditIssues: issues,
    dealStage, leadSource,
    workflowSteps:  WORKFLOW_STEPS,
    recentChanges:  RECENT_CHANGES,
    healthMetrics:  HEALTH_METRICS,
    roles:          ROLES,
    roleMatrix:     ROLE_MATRIX,
    passedChecks,

    // fields module selector
    selectedModule, setSelectedModule, loadFieldsForModule, fieldsLoading,

    // CRUD
    addModule, addWorkflow, deleteWorkflow,
    addField, deleteField,
    addFunction, addOption, resolveIssue,
    fetchFunctionsByType,
    fetchWorkflowUsage,

    // Zia
    ziaMessages, ziaLoading, sendZiaMessage,

    // scheduled reports
    scheduledReports, createScheduledReport, deleteScheduledReport, runScheduledReport,

    // derived
    auditScore, counts,
  };
}
