// ─── CRM Audit Studio · Pages ────────────────────────────────────────────────
// All 8 pages in one file.  Split into individual files if preferred —
// each export is a self-contained functional component.

import { useState, useRef, useEffect } from "react";
import {
  Card, CardTitle, StatCard, ProgressRow,
  Pill, StatusPill, Btn, Table,
  SearchBar, InnerTabs, AccordionItem,
} from "../components/UI";
import WorkflowCanvas from "../components/WorkflowCanvas";
import { WORKFLOW_ISSUE_PARAMS, FUNCTION_ISSUE_PARAMS, FIELD_ISSUE_PARAMS, MODULE_ISSUE_PARAMS } from "../data/crmData";

// ── Issue code badge ─────────────────────────────────────────────────────────
const CODE_PREFIX_STYLE = {
  'WF': { bg: '#E6F1FB', color: '#185FA5' },
  'FN': { bg: '#EEEDFE', color: '#3C3489' },
  'MD': { bg: '#FAEEDA', color: '#854F0B' },
  'FD': { bg: '#EAF3DE', color: '#3B6D11' },
  'AL': { bg: '#f0f0ed', color: '#555'    },
  'BP': { bg: '#E1F5EE', color: '#085041' },
  'SC': { bg: '#E6F1FB', color: '#0C447C' },
};

function IssueCode({ code, tooltip }) {
  if (!code) return null;
  const prefix = code.split('-')[0];
  const s = CODE_PREFIX_STYLE[prefix] || { bg: '#f0f0ed', color: '#555' };
  return (
    <span
      title={tooltip || undefined}
      style={{
        fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
        background: s.bg, color: s.color,
        padding: '2px 6px', borderRadius: 5,
        letterSpacing: '0.2px', flexShrink: 0,
        cursor: tooltip ? 'help' : 'default',
      }}
    >
      {code}
    </span>
  );
}

// Shared row used by both WorkflowParamsTable and FunctionParamsTable
function IssueParamRow({ p }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto auto 1fr auto",
      gap: "10px 14px",
      alignItems: "start",
      padding: "12px 0",
      borderBottom: "0.5px solid #e0ddd6",
    }}>
      {/* Code badge — tooltip shows parameter name */}
      <IssueCode code={p.code} tooltip={p.parameter} />

      {/* Parameter name */}
      <code style={{
        fontSize: 12, background: "#f5f4f0",
        padding: "2px 7px", borderRadius: 5,
        color: "#333", whiteSpace: "nowrap",
      }}>
        {p.parameter}
      </code>

      {/* Description + Resolution with labeled tags */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, flexShrink: 0, marginTop: 2,
            background: "#E6F1FB", color: "#185FA5",
            padding: "2px 6px", borderRadius: 4,
          }}>
            Description
          </span>
          <span style={{ fontSize: 13, color: "#222", lineHeight: 1.5 }}>{p.description}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, flexShrink: 0, marginTop: 2,
            background: "#E1F5EE", color: "#085041",
            padding: "2px 6px", borderRadius: 4,
          }}>
            Resolution
          </span>
          <span style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{p.resolution}</span>
        </div>
      </div>

      {/* Severity + entity */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <Pill variant={SEVERITY_PILL[p.severity] || "gray"}>{p.severity}</Pill>
        <span style={{ fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }}>{p.entity}</span>
      </div>
    </div>
  );
}

// ── Severity lookup tables (shared across Audit, Workflows, Overview) ─────────
const SEVERITY_STYLES = {
  critical: { bg: "#FCEBEB", color: "#A32D2D", icon: "x"               },
  high:     { bg: "#FEF0E7", color: "#C24B0A", icon: "alert-triangle"   },
  medium:   { bg: "#FAEEDA", color: "#854F0B", icon: "alert-circle"     },
  low:      { bg: "#E6F1FB", color: "#185FA5", icon: "info-circle"      },
  info:     { bg: "#f0f0ed", color: "#666",    icon: "note"             },
};

const SEVERITY_PILL = {
  critical: "red",
  high:     "amber",
  medium:   "purple",
  low:      "blue",
  info:     "gray",
};

const SEVERITY_ACTION = {
  critical: "Immediate action",
  high:     "Fix before next release",
  medium:   "Fix within current sprint",
  low:      "Fix in next maintenance window",
  info:     "No immediate action",
};

// ── Shared page header ────────────────────────────────────────────────────────
function PageHeader({ title, sub, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{sub}</div>}
      </div>
      {children && <div style={{ display: "flex", gap: 8 }}>{children}</div>}
    </div>
  );
}

function StatsRow({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: "1.25rem" }}>{children}</div>;
}

function Split({ children, cols = "1fr 1fr" }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: "1rem" }}>{children}</div>;
}


// ─────────────────────────────────────────────────────────────────────────────
// 1. OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
export function Overview({ auditScore, healthMetrics, auditIssues, recentChanges, counts }) {
  const iconMap = {
    critical: "x",
    high:     "alert-triangle",
    medium:   "alert-circle",
    low:      "info-circle",
    info:     "note",
  };
  const colorMap = {
    critical: { bg: "#FCEBEB", color: "#A32D2D" },
    high:     { bg: "#FEF0E7", color: "#C24B0A" },
    medium:   { bg: "#FAEEDA", color: "#854F0B" },
    low:      { bg: "#E6F1FB", color: "#185FA5" },
    info:     { bg: "#f0f0ed", color: "#666"    },
  };

  return (
    <div>
      <PageHeader title="CRM overview" sub="Last audited 2 hours ago · Zoho CRM v6.1">
        <Btn onClick={() => window.sendPrompt?.("What CRM platforms do you support for auditing? How do I connect my CRM?")}>Connect CRM ↗</Btn>
      </PageHeader>

      <StatsRow>
        <StatCard value={counts.modules}   label="Modules"   delta="↑ 2 this month" deltaType="up" />
        <StatCard value={counts.workflows}  label="Workflows" delta={`${counts.inactive} inactive`} deltaType="warn" />
        <StatCard value={counts.fields}     label="Fields"    delta="↑ 6 new" deltaType="up" />
        <StatCard value={counts.functions}  label="Functions" delta={`${counts.errors} errors`} deltaType="warn" />
        <StatCard value={`${auditScore}%`}  label="Audit score" delta="↓ from 78%" deltaType="warn" />
      </StatsRow>

      <Split>
        <Card>
          <CardTitle icon="activity">Audit health</CardTitle>
          {healthMetrics.map(m => <ProgressRow key={m.label} label={m.label} value={m.value} color={m.color} />)}
        </Card>
        <Card>
          <CardTitle icon="alert-triangle">Active issues</CardTitle>
          {auditIssues.slice(0, 4).map(issue => {
            const c = colorMap[issue.severity] || colorMap.info;
            return (
              <div key={issue.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "0.5px solid #e0ddd6" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  <i className={`ti ti-${iconMap[issue.severity]}`} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <IssueCode code={issue.code} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{issue.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{issue.desc.slice(0, 80)}…</div>
                </div>
              </div>
            );
          })}
        </Card>
      </Split>

      <Card>
        <CardTitle icon="clock">Recent changes</CardTitle>
        <Table
          columns={["Change", "Module", "By", "Date", "Status"]}
          rows={recentChanges.map(r => [r.change, r.module, r.by, r.date, <StatusPill status={r.status} />])}
        />
      </Card>
    </div>
  );
}


function ModuleIssuesView({ modules }) {
  if (modules.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa", fontSize: 13 }}>
        No modules with issues found.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {modules.map(mod => {
        const params = (mod.issues || [])
          .map(code => MODULE_ISSUE_PARAMS.find(p => p.code === code))
          .filter(Boolean);
        const highestSev = params.find(p => p.severity === "critical") ? "critical"
          : params.find(p => p.severity === "high") ? "high"
          : params.find(p => p.severity === "medium") ? "medium"
          : params.find(p => p.severity === "low") ? "low" : "info";
        const sevStyle = SEVERITY_STYLES[highestSev] || SEVERITY_STYLES.info;
        return (
          <Card key={mod.id}>
            {/* Module header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: "0.5px solid #e0ddd6" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: mod.color, color: mod.textColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>
                <i className={`ti ti-${mod.icon}`} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{mod.name}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                  {mod.fields} fields · {mod.workflows} workflows · {mod.functions} functions
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: sevStyle.bg, color: sevStyle.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>
                  {params.length} issue{params.length !== 1 ? "s" : ""}
                </span>
                <StatusPill status={mod.health} />
              </div>
            </div>

            {/* Parameter rows */}
            {params.map(p => (
              <div key={p.code} style={{
                display: "grid", gridTemplateColumns: "auto auto 1fr auto",
                gap: "8px 14px", alignItems: "start",
                padding: "9px 0", borderBottom: "0.5px solid #f0ede8",
              }}>
                <IssueCode code={p.code} tooltip={p.parameter} />
                <code style={{ fontSize: 11, background: "#f5f4f0", padding: "2px 7px", borderRadius: 4, color: "#555", whiteSpace: "nowrap", marginTop: 1 }}>
                  {p.parameter}
                </code>
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, background: "#E6F1FB", color: "#185FA5", padding: "2px 5px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>
                      Description
                    </span>
                    <span style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{p.description}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, background: "#E1F5EE", color: "#085041", padding: "2px 5px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>
                      Resolution
                    </span>
                    <span style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>{p.resolution}</span>
                  </div>
                </div>
                <Pill variant={SEVERITY_PILL[p.severity] || "gray"}>{p.severity}</Pill>
              </div>
            ))}

            {params.length === 0 && (
              <div style={{ fontSize: 12, color: "#aaa", padding: "8px 0" }}>
                No specific parameter violations recorded.
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <Btn small onClick={() => window.sendPrompt?.(`Run a full module audit for ${mod.name} against the MD-001 to MD-015 parameter checklist and report all violations`)}>
                Audit {mod.name} ↗
              </Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const MD_PAGE_TABS = [
  { id: "list",   label: "Modules"          },
  { id: "params", label: "Issue Parameters" },
];

function ModuleParamsTable() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [paramSearch,    setParamSearch]    = useState("");

  const severities = ["all", "critical", "high", "medium", "low", "info"];
  const paramCounts = severities.reduce((acc, s) => {
    acc[s] = s === "all"
      ? MODULE_ISSUE_PARAMS.length
      : MODULE_ISSUE_PARAMS.filter(p => p.severity === s).length;
    return acc;
  }, {});

  const displayed = MODULE_ISSUE_PARAMS
    .filter(p => severityFilter === "all" || p.severity === severityFilter)
    .filter(p => {
      if (!paramSearch) return true;
      const q = paramSearch.toLowerCase();
      return p.parameter.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    });

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: 8 }}>
        <CardTitle icon="list-check">MD-001 – MD-015 · Module scan parameters</CardTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 3 }}>
            {severities.map(lvl => {
              const s      = SEVERITY_STYLES[lvl];
              const active = severityFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 9px", borderRadius: 20, fontSize: 11,
                    fontFamily: "inherit", cursor: "pointer", border: "0.5px solid",
                    transition: "all 0.15s",
                    background:  active ? (s ? s.bg    : "#111") : "transparent",
                    color:       active ? (s ? s.color : "#fff") : "#888",
                    borderColor: active ? (s ? s.color : "#333") : "#e0ddd6",
                    fontWeight:  active ? 600 : 400,
                  }}
                >
                  {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  <span style={{ fontSize: 10, background: "rgba(0,0,0,0.08)", padding: "0 4px", borderRadius: 99 }}>
                    {paramCounts[lvl]}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f4f0", border: "0.5px solid #e0ddd6", borderRadius: 8, padding: "0 10px", minWidth: 180 }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 13, color: "#aaa" }} />
            <input
              type="text" value={paramSearch} onChange={e => setParamSearch(e.target.value)}
              placeholder="Search parameters…"
              style={{ border: "none", background: "none", padding: "6px 0", fontSize: 12, flex: 1, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </div>

      {displayed.map(p => <IssueParamRow key={p.code} p={p} />)}

      {displayed.length === 0 && (
        <div style={{ padding: "1.5rem 0", textAlign: "center", fontSize: 13, color: "#aaa" }}>
          No parameters match the current filters.
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <Btn small onClick={() => window.sendPrompt?.("Scan all modules against the MD-001 to MD-015 parameter checklist and report any violations found")}>Run MD scan ↗</Btn>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MODULES
// ─────────────────────────────────────────────────────────────────────────────
const AUDIT_SEVERITY_STYLE = {
  high:   { bg: "#FFF0F0", color: "#c0392b", border: "#ffcccc" },
  medium: { bg: "#FFFBE6", color: "#7a5c00", border: "#f0d060" },
  low:    { bg: "#F0FAF5", color: "#0F6E56", border: "#a8dfc4" },
};

function ModuleAuditPanel({ modules, onClose }) {
  const [state,   setState]   = useState("idle"); // idle | loading | done | error
  const [issues,  setIssues]  = useState([]);
  const [summary, setSummary] = useState("");
  const [usedMcp, setUsedMcp] = useState(false);
  const [errMsg,  setErrMsg]  = useState("");

  async function runAudit() {
    setState("loading");
    setIssues([]); setSummary(""); setErrMsg("");
    try {
      const res  = await fetch("/api/audit/modules", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ modules }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Audit failed");
      setIssues(data.issues  || []);
      setSummary(data.summary || "");
      setUsedMcp(!!data.usedMcp);
      setState("done");
    } catch (err) {
      setErrMsg(err.message);
      setState("error");
    }
  }

  const high   = issues.filter(i => i.severity === "high").length;
  const medium = issues.filter(i => i.severity === "medium").length;
  const low    = issues.filter(i => i.severity === "low").length;

  return (
    <div style={{
      background: "#fff", border: "0.5px solid #e0ddd6", borderRadius: 12,
      padding: "18px 20px", marginBottom: "1.25rem",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-shield-check" style={{ fontSize: 16, color: "#1D9E75" }} aria-hidden="true" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Module Audit</span>
          {usedMcp && (
            <span style={{ fontSize: 11, fontWeight: 500, background: "#E1F5EE", color: "#085041", padding: "2px 8px", borderRadius: 99 }}>
              via Zoho MCP
            </span>
          )}
          {state === "done" && !usedMcp && (
            <span style={{ fontSize: 11, color: "#aaa" }}>via REST data</span>
          )}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
      </div>

      {/* Idle state */}
      {state === "idle" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
            Claude will check all modules across 7 audit points: unused, duplicate, missing descriptions, naming, empty, and disabled standard modules.
          </p>
          <Btn primary onClick={runAudit}>
            <i className="ti ti-player-play" aria-hidden="true" /> Run Module Audit
          </Btn>
        </div>
      )}

      {/* Loading */}
      {state === "loading" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: "#666", fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: "pulse 1.2s infinite" }} />
          Claude is auditing your modules…
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div style={{ background: "#FFF0F0", border: "0.5px solid #ffcccc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c0392b", marginBottom: 12 }}>
          {errMsg}
          <Btn small onClick={runAudit} style={{ marginLeft: 12 }}>Retry</Btn>
        </div>
      )}

      {/* Results */}
      {state === "done" && (
        <>
          {/* Score pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { label: `${high} High`,   ...AUDIT_SEVERITY_STYLE.high   },
              { label: `${medium} Medium`, ...AUDIT_SEVERITY_STYLE.medium },
              { label: `${low} Low`,     ...AUDIT_SEVERITY_STYLE.low    },
            ].map(s => (
              <span key={s.label} style={{ fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, border: `0.5px solid ${s.border}`, padding: "3px 10px", borderRadius: 99 }}>
                {s.label}
              </span>
            ))}
            <Btn small onClick={runAudit} style={{ marginLeft: "auto" }}>Re-run</Btn>
          </div>

          {/* Summary */}
          {summary && (
            <p style={{ fontSize: 13, color: "#555", marginBottom: 14, lineHeight: 1.6, background: "#f5f4f0", borderRadius: 8, padding: "10px 12px" }}>
              {summary}
            </p>
          )}

          {/* Issue list */}
          {issues.length === 0 ? (
            <div style={{ fontSize: 13, color: "#0F6E56", background: "#F0FAF5", borderRadius: 8, padding: "12px 14px" }}>
              No issues found — your modules look healthy!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {issues.map((item, i) => {
                const s = AUDIT_SEVERITY_STYLE[item.severity] || AUDIT_SEVERITY_STYLE.low;
                return (
                  <div key={i} style={{ display: "flex", gap: 12, background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{item.module}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, background: "#fff", color: s.color, border: `0.5px solid ${s.border}`, padding: "1px 7px", borderRadius: 99 }}>
                          {item.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{item.issue}</div>
                      <div style={{ fontSize: 12, color: "#333", fontStyle: "italic" }}>→ {item.recommendation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Modules({ modules, openModal }) {
  const [pageTab,    setPageTab]    = useState("list");
  const [query,      setQuery]      = useState("");
  const [healthTab,  setHealthTab]  = useState("all");
  const [auditOpen,  setAuditOpen]  = useState(false);
  const hasIssues = m => (m.issues || []).length > 0;
  const bySearch  = modules.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
  const filtered  = bySearch.filter(m => {
    if (healthTab === "all")    return !hasIssues(m);
    if (healthTab === "issues") return hasIssues(m);
    return m.health === healthTab && !hasIssues(m);
  });
  const HEALTH_TABS = [
    { id: "all",    label: "All",    count: bySearch.filter(m => !hasIssues(m)).length },
    { id: "good",   label: "Good",   count: bySearch.filter(m => m.health === "good"   && !hasIssues(m)).length },
    { id: "review", label: "Review", count: bySearch.filter(m => m.health === "review" && !hasIssues(m)).length },
    { id: "issues", label: "Issues", count: bySearch.filter(m =>  hasIssues(m)).length },
  ];

  return (
    <div>
      <PageHeader title="Modules" sub={`${modules.length} modules · ${modules.filter(m => hasIssues(m)).length} with parameter issues`}>
        {pageTab === "list" && (
          <>
            <Btn onClick={() => setAuditOpen(o => !o)}>
              <i className="ti ti-shield-check" aria-hidden="true" /> Audit
            </Btn>
            <Btn primary onClick={() => openModal("add-module")}>
              <i className="ti ti-plus" aria-hidden="true" /> New module
            </Btn>
          </>
        )}
      </PageHeader>
      {auditOpen && <ModuleAuditPanel modules={modules} onClose={() => setAuditOpen(false)} />}

      <InnerTabs tabs={MD_PAGE_TABS} active={pageTab} onChange={setPageTab} />

      {pageTab === "params" && <ModuleParamsTable />}
      {pageTab === "list" && (<>
        <SearchBar placeholder="Search modules…" value={query} onChange={setQuery} />
        <InnerTabs tabs={HEALTH_TABS} active={healthTab} onChange={setHealthTab} />

        {healthTab === "issues" ? (
          <ModuleIssuesView modules={filtered} />
        ) : (<>
          {/* Icon grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: "1.25rem" }}>
            {filtered.map(mod => (
              <div key={mod.id}
                onClick={() => window.sendPrompt?.(`Show me all fields, workflows, and functions for the ${mod.name} CRM module`)}
                style={{
                  background: "#fff", border: "0.5px solid #e0ddd6", borderRadius: 12,
                  padding: 14, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1D9E75"; e.currentTarget.style.background = "#F8FFFC"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0ddd6"; e.currentTarget.style.background = "#fff"; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: mod.color, color: mod.textColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>
                  <i className={`ti ti-${mod.icon}`} aria-hidden="true" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{mod.name}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{mod.fields} fields · {mod.workflows} workflows</div>
              </div>
            ))}
            {/* Add new tile */}
            <div onClick={() => openModal("add-module")} style={{ background: "#fff", border: "0.5px dashed #ccc", borderRadius: 12, padding: 14, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5f4f0", color: "#aaa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>
                <i className="ti ti-plus" aria-hidden="true" />
              </div>
              <div style={{ fontSize: 13, color: "#aaa" }}>New module</div>
            </div>
          </div>

          <Card>
            <CardTitle icon="list">Module summary</CardTitle>
            <Table
              columns={["Module", "Fields", "Workflows", "Functions", "Last modified", "Health"]}
              rows={filtered.map(m => [
                <b>{m.name}</b>, m.fields, m.workflows, m.functions, "—", <StatusPill status={m.health} />
              ])}
            />
          </Card>
        </>)}
      </>)}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. WORKFLOWS
// ─────────────────────────────────────────────────────────────────────────────
function WorkflowUsagePanel({ wf, fetchWorkflowUsage, onClose }) {
  const defaultFrom = () => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  };
  const defaultTill = () => new Date().toISOString().split("T")[0];

  const [from, setFrom] = useState(defaultFrom);
  const [till, setTill] = useState(defaultTill);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load(f, t) {
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetchWorkflowUsage(wf.id, f, t);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(from, till); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const actions = data?.action_usage ?? data?.actions ?? data?.data ?? [];
  const totalExec = Array.isArray(actions)
    ? actions.reduce((s, a) => s + (a.executed ?? a.executed_count ?? 0), 0)
    : null;

  return (
    <Card>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            <i className="ti ti-chart-bar" aria-hidden="true" style={{ marginRight: 6, color: "#1D9E75" }} />
            Usage — {wf.name}
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
            {wf.module} · <StatusPill status={wf.status} />
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18, padding: "2px 6px", borderRadius: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = "#555"}
          onMouseLeave={e => e.currentTarget.style.color = "#aaa"}
          title="Close"
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      {/* Date range picker */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, color: "#555", fontWeight: 500, whiteSpace: "nowrap" }}>From</label>
          <input
            type="date" value={from} max={till}
            onChange={e => setFrom(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer", width: 150 }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, color: "#555", fontWeight: 500, whiteSpace: "nowrap" }}>To</label>
          <input
            type="date" value={till} min={from}
            onChange={e => setTill(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer", width: 150 }}
          />
        </div>
        <Btn primary small onClick={() => load(from, till)}>
          <i className="ti ti-refresh" aria-hidden="true" /> Fetch
        </Btn>
        {/* Quick ranges */}
        {[
          { label: "7d",  days: 7  },
          { label: "30d", days: 30 },
          { label: "90d", days: 90 },
        ].map(({ label, days }) => (
          <button
            key={label}
            onClick={() => {
              const t = new Date().toISOString().split("T")[0];
              const f = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
              setFrom(f); setTill(t); load(f, t);
            }}
            style={{ padding: "5px 10px", borderRadius: 6, border: "0.5px solid #e0ddd6", background: "#f5f4f0", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#555" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#E1F5EE"; e.currentTarget.style.borderColor = "#1D9E75"; e.currentTarget.style.color = "#0F6E56"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f5f4f0"; e.currentTarget.style.borderColor = "#e0ddd6"; e.currentTarget.style.color = "#555"; }}
          >
            Last {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem 0", color: "#888", fontSize: 13 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: "pulse 1.2s ease-in-out infinite" }} />
          Fetching usage data…
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", border: "0.5px solid #f5c6c6", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#A32D2D", marginBottom: "0.75rem" }}>
          <i className="ti ti-alert-circle" aria-hidden="true" style={{ marginRight: 6 }} />
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && data && (
        <>
          {/* Summary stat */}
          {totalExec !== null && (
            <div style={{ display: "flex", gap: 10, marginBottom: "1rem" }}>
              <div style={{ background: "#f5f4f0", borderRadius: 8, padding: "10px 16px", flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#111" }}>{totalExec}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Total executions</div>
              </div>
              <div style={{ background: "#f0faf6", borderRadius: 8, padding: "10px 16px", flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#0F6E56" }}>
                  {Array.isArray(actions) ? actions.reduce((s, a) => s + (a.success ?? a.success_count ?? 0), 0) : "—"}
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Successful</div>
              </div>
              <div style={{ background: "#FCEBEB", borderRadius: 8, padding: "10px 16px", flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#A32D2D" }}>
                  {Array.isArray(actions) ? actions.reduce((s, a) => s + (a.failure ?? a.failure_count ?? 0), 0) : "—"}
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Failed</div>
              </div>
            </div>
          )}

          {/* Actions table */}
          {Array.isArray(actions) && actions.length > 0 ? (
            <Table
              columns={["Action", "Type", "Executed", "Success", "Failed"]}
              rows={actions.map(a => [
                a.name ?? a.action_name ?? a.id ?? "—",
                <Pill variant="blue">{a.type ?? a.action_type ?? "—"}</Pill>,
                a.executed ?? a.executed_count ?? "—",
                <span style={{ color: "#0F6E56", fontWeight: 500 }}>{a.success ?? a.success_count ?? "—"}</span>,
                <span style={{ color: "#c0392b", fontWeight: 500 }}>{a.failure ?? a.failure_count ?? "—"}</span>,
              ])}
            />
          ) : (
            <pre style={{ fontSize: 11, color: "#555", background: "#f5f4f0", padding: 12, borderRadius: 8, overflowX: "auto", lineHeight: 1.6 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </>
      )}
    </Card>
  );
}

const WF_PAGE_TABS = [
  { id: "list",   label: "Workflows"        },
  { id: "params", label: "Issue Parameters" },
];

const STATUS_FILTER_TABS = [
  { id: "all",      label: "All"      },
  { id: "active",   label: "Active"   },
  { id: "inactive", label: "Inactive" },
  { id: "draft",    label: "Draft"    },
];

function WorkflowParamsTable() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [paramSearch,    setParamSearch]    = useState("");

  const severities = ["all", "critical", "high", "medium", "low", "info"];
  const paramCounts = severities.reduce((acc, s) => {
    acc[s] = s === "all"
      ? WORKFLOW_ISSUE_PARAMS.length
      : WORKFLOW_ISSUE_PARAMS.filter(p => p.severity === s).length;
    return acc;
  }, {});

  const displayed = WORKFLOW_ISSUE_PARAMS
    .filter(p => severityFilter === "all" || p.severity === severityFilter)
    .filter(p => {
      if (!paramSearch) return true;
      const q = paramSearch.toLowerCase();
      return p.parameter.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    });

  return (
    <Card>
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: 8 }}>
        <CardTitle icon="list-check">WF-001 – WF-018 · Workflow scan parameters</CardTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Severity filter */}
          <div style={{ display: "flex", gap: 3 }}>
            {severities.map(lvl => {
              const s      = SEVERITY_STYLES[lvl];
              const active = severityFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 9px", borderRadius: 20, fontSize: 11,
                    fontFamily: "inherit", cursor: "pointer", border: "0.5px solid",
                    transition: "all 0.15s",
                    background:  active ? (s ? s.bg    : "#111") : "transparent",
                    color:       active ? (s ? s.color : "#fff") : "#888",
                    borderColor: active ? (s ? s.color : "#333") : "#e0ddd6",
                    fontWeight:  active ? 600 : 400,
                  }}
                >
                  {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  <span style={{ fontSize: 10, background: "rgba(0,0,0,0.08)", padding: "0 4px", borderRadius: 99 }}>
                    {paramCounts[lvl]}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f4f0", border: "0.5px solid #e0ddd6", borderRadius: 8, padding: "0 10px", minWidth: 180 }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 13, color: "#aaa" }} />
            <input
              type="text" value={paramSearch} onChange={e => setParamSearch(e.target.value)}
              placeholder="Search parameters…"
              style={{ border: "none", background: "none", padding: "6px 0", fontSize: 12, flex: 1, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </div>

      {/* Parameters list */}
      {displayed.map(p => <IssueParamRow key={p.code} p={p} />)}

      {displayed.length === 0 && (
        <div style={{ padding: "1.5rem 0", textAlign: "center", fontSize: 13, color: "#aaa" }}>
          No parameters match the current filters.
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <Btn small onClick={() => window.sendPrompt?.("Scan all workflows against the WF-001 to WF-018 parameter checklist and report any violations found")}>Run WF scan ↗</Btn>
      </div>
    </Card>
  );
}

export function Workflows({ workflows, workflowSteps, openModal, deleteWorkflow, fetchWorkflowUsage }) {
  const [pageTab,      setPageTab]      = useState("list");
  const [tab,          setTab]          = useState("all");
  const [query,        setQuery]        = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [usageWf,      setUsageWf]      = useState(null);

  const moduleOptions = [...new Set(workflows.map(w => w.module))];
  const filtered = workflows
    .filter(w => tab === "all" || w.status === tab)
    .filter(w => !query || w.name.toLowerCase().includes(query.toLowerCase()))
    .filter(w => moduleFilter === "all" || w.module === moduleFilter);

  function handleDelete(wf) {
    if (window.confirm(`Delete workflow "${wf.name}"?`)) {
      deleteWorkflow?.(wf.id);
    }
  }

  return (
    <div>
      <PageHeader title="Workflows" sub={`${workflows.length} workflows · ${workflows.filter(w=>w.status==="inactive").length} inactive`}>
        {pageTab === "list" && (
          <Btn primary onClick={() => openModal("add-workflow")}>
            <i className="ti ti-plus" aria-hidden="true" /> New workflow
          </Btn>
        )}
      </PageHeader>

      <InnerTabs tabs={WF_PAGE_TABS} active={pageTab} onChange={setPageTab} />

      {pageTab === "params" && <WorkflowParamsTable />}
      {pageTab === "list" && (<>

      <Card>
        <CardTitle icon="git-branch">Lead scoring workflow — visual preview</CardTitle>
        <WorkflowCanvas steps={workflowSteps} status="inactive" />
        <Btn small onClick={() => window.sendPrompt?.("Analyze the lead scoring workflow and suggest improvements")}>Analyze ↗</Btn>
      </Card>

      <Card>
        <CardTitle icon="list-check">All workflows</CardTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#f5f4f0", border: "0.5px solid #e0ddd6", borderRadius: 8, padding: "0 10px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 15, color: "#888" }} />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search workflows…"
              style={{ border: "none", background: "none", padding: "8px 0", fontSize: 13, flex: 1, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <select
            value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
            style={{ padding: "0 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer" }}
          >
            <option value="all">All modules</option>
            {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <InnerTabs tabs={STATUS_FILTER_TABS} active={tab} onChange={setTab} />
        <Table
          columns={["Name", "Module", "Trigger", "Steps", "Last run", "Status", ""]}
          rows={filtered.map(w => [
            <b>{w.name}</b>, w.module, w.trigger, w.steps, w.lastRun,
            <StatusPill status={w.status} />,
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setUsageWf(prev => prev?.id === w.id ? null : w)}
                title="View usage"
                style={{ background: "none", border: "none", cursor: "pointer", color: usageWf?.id === w.id ? "#1D9E75" : "#ccc", padding: "2px 4px", fontSize: 15, borderRadius: 6 }}
                onMouseEnter={e => { if (usageWf?.id !== w.id) e.currentTarget.style.color = "#1D9E75"; }}
                onMouseLeave={e => { if (usageWf?.id !== w.id) e.currentTarget.style.color = "#ccc"; }}
              >
                <i className="ti ti-chart-bar" aria-hidden="true" />
              </button>
              <button
                onClick={() => handleDelete(w)}
                title="Delete workflow"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "2px 4px", fontSize: 15, borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
                onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
              >
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>,
          ])}
        />
      </Card>

      {usageWf && (
        <WorkflowUsagePanel
          wf={usageWf}
          fetchWorkflowUsage={fetchWorkflowUsage}
          onClose={() => setUsageWf(null)}
        />
      )}
      </>)}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 4. FIELDS
// ─────────────────────────────────────────────────────────────────────────────
const FD_PAGE_TABS = [
  { id: "list",   label: "Fields"           },
  { id: "params", label: "Issue Parameters" },
];

function FieldParamsTable() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [paramSearch,    setParamSearch]    = useState("");

  const severities  = ["all", "critical", "high", "medium", "low", "info"];
  const paramCounts = severities.reduce((acc, s) => {
    acc[s] = s === "all"
      ? FIELD_ISSUE_PARAMS.length
      : FIELD_ISSUE_PARAMS.filter(p => p.severity === s).length;
    return acc;
  }, {});

  const displayed = FIELD_ISSUE_PARAMS
    .filter(p => severityFilter === "all" || p.severity === severityFilter)
    .filter(p => {
      if (!paramSearch) return true;
      const q = paramSearch.toLowerCase();
      return p.parameter.toLowerCase().includes(q)
          || p.description.toLowerCase().includes(q)
          || p.code.toLowerCase().includes(q);
    });

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: 8 }}>
        <CardTitle icon="list-check">FD-001 – FD-018 · Field scan parameters</CardTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 3 }}>
            {severities.map(lvl => {
              const s      = SEVERITY_STYLES[lvl];
              const active = severityFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 9px", borderRadius: 20, fontSize: 11,
                    fontFamily: "inherit", cursor: "pointer", border: "0.5px solid",
                    transition: "all 0.15s",
                    background:  active ? (s ? s.bg    : "#111") : "transparent",
                    color:       active ? (s ? s.color : "#fff") : "#888",
                    borderColor: active ? (s ? s.color : "#333") : "#e0ddd6",
                    fontWeight:  active ? 600 : 400,
                  }}
                >
                  {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  <span style={{ fontSize: 10, background: "rgba(0,0,0,0.08)", padding: "0 4px", borderRadius: 99 }}>
                    {paramCounts[lvl]}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f4f0", border: "0.5px solid #e0ddd6", borderRadius: 8, padding: "0 10px", minWidth: 180 }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 13, color: "#aaa" }} />
            <input
              type="text" value={paramSearch} onChange={e => setParamSearch(e.target.value)}
              placeholder="Search parameters…"
              style={{ border: "none", background: "none", padding: "6px 0", fontSize: 12, flex: 1, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </div>

      {displayed.map(p => <IssueParamRow key={p.code} p={p} />)}

      {displayed.length === 0 && (
        <div style={{ padding: "1.5rem 0", textAlign: "center", fontSize: 13, color: "#aaa" }}>
          No parameters match the current filters.
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <Btn small onClick={() => window.sendPrompt?.("Scan all CRM fields against the FD-001 to FD-018 parameter checklist and report any violations found")}>Run FD scan ↗</Btn>
      </div>
    </Card>
  );
}

const FIELD_TYPE_COLORS = {
  Text: "blue", Currency: "blue", Integer: "blue",
  Picklist: "amber", Date: "purple", DateTime: "purple",
  Lookup: "blue", Formula: "green", Unknown: "gray",
};

export function Fields({
  fields, dealStage, openModal, deleteField,
  modules, selectedModule, setSelectedModule, loadFieldsForModule, fieldsLoading,
}) {
  const [pageTab, setPageTab] = useState("list");
  const [tab, setTab] = useState("all");
  const moduleFields = fields.filter(f => f.module === selectedModule);
  const TABS = [{ id: "all", label: "All fields" }, { id: "custom", label: "Custom" }, { id: "undoc", label: "Undocumented" }];
  const tabFiltered = tab === "all" ? moduleFields
    : tab === "undoc" ? moduleFields.filter(f => f.documented === "no")
    : moduleFields.filter(f => f.custom !== false);

  const fieldTypeCounts = moduleFields.reduce((acc, f) => { acc[f.type] = (acc[f.type]||0)+1; return acc; }, {});

  function handleModuleChange(e) {
    const mod = e.target.value;
    setSelectedModule(mod);
    loadFieldsForModule(mod);
  }

  function handleDelete(f) {
    if (window.confirm(`Delete field "${f.name}" from ${selectedModule}?`)) {
      deleteField?.(f.id, selectedModule);
    }
  }

  const moduleOptions = modules?.length
    ? modules.map(m => m.name)
    : ["Leads", "Deals", "Contacts", "Accounts", "Activities", "Campaigns"];

  return (
    <div>
      <PageHeader title="Fields" sub={`${moduleFields.length} fields in ${selectedModule} · ${moduleFields.filter(f=>f.documented==="no").length} undocumented`}>
        {pageTab === "list" && (<>
          <Btn onClick={() => window.sendPrompt?.("Help me identify and document all undocumented CRM fields with proper descriptions and data types")}>Auto-document ↗</Btn>
          <Btn primary onClick={() => openModal("add-field")}>
            <i className="ti ti-plus" aria-hidden="true" /> Add field
          </Btn>
        </>)}
      </PageHeader>

      <InnerTabs tabs={FD_PAGE_TABS} active={pageTab} onChange={setPageTab} />

      {pageTab === "params" && <FieldParamsTable />}
      {pageTab === "list" && (<>

      {/* Module selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
        <label style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Module:</label>
        <select
          value={selectedModule}
          onChange={handleModuleChange}
          style={{
            padding: "5px 10px", borderRadius: 8, border: "0.5px solid #e0ddd6",
            fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer",
          }}
        >
          {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {fieldsLoading && <span style={{ fontSize: 12, color: "#888" }}>Loading…</span>}
      </div>

      <Split cols="2fr 1fr">
        <Card>
          <CardTitle icon="table">Fields — {selectedModule}</CardTitle>
          <InnerTabs tabs={TABS} active={tab} onChange={setTab} />
          {tabFiltered.length === 0
            ? <div style={{ fontSize: 13, color: "#888", padding: "8px 0" }}>No fields in this view.</div>
            : <Table
                columns={["Field name", "Type", "Required", "Documented", ""]}
                rows={tabFiltered.map(f => [
                  f.name,
                  <Pill variant={FIELD_TYPE_COLORS[f.type] || "gray"}>{f.type}</Pill>,
                  f.required ? "✓" : "",
                  <StatusPill status={f.documented} />,
                  <button
                    onClick={() => handleDelete(f)}
                    title="Delete field"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "2px 4px", fontSize: 14, borderRadius: 6 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
                    onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
                  >
                    <i className="ti ti-trash" aria-hidden="true" />
                  </button>,
                ])}
              />
          }
        </Card>

        <div>
          <Card>
            <CardTitle icon="chart-donut">Field types</CardTitle>
            {Object.entries(fieldTypeCounts).length === 0
              ? <div style={{ fontSize: 13, color: "#aaa" }}>No data</div>
              : Object.entries(fieldTypeCounts).map(([type, count]) => (
                  <ProgressRow key={type} label={type} value={Math.round(count / moduleFields.length * 100)} color="green" />
                ))
            }
          </Card>

          <Card>
            <CardTitle icon="list-details">Deal stage options</CardTitle>
            {dealStage.map(opt => (
              <AccordionItem key={opt.label} title={opt.label} badge={<StatusPill status={opt.status} />}>
                <div style={{ fontSize: 12 }}>
                  {opt.prob != null && <div>Probability: {opt.prob}%</div>}
                  {opt.order != null && <div>Sort order: {opt.order}</div>}
                  {opt.status === "orphaned" && (
                    <div style={{ marginTop: 6 }}>
                      Not mapped to any workflow stage. Consider removing.
                      <div style={{ marginTop: 6 }}>
                        <Btn small onClick={() => window.sendPrompt?.(`Should I delete the ${opt.label} picklist value from Deals stage? What would be the impact?`)}>Impact analysis ↗</Btn>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionItem>
            ))}
            <div style={{ marginTop: 10 }}>
              <Btn small onClick={() => openModal("add-option")}>
                <i className="ti ti-plus" aria-hidden="true" /> Add option
              </Btn>
            </div>
          </Card>
        </div>
      </Split>
      </>)}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
const FN_PAGE_TABS = [
  { id: "list",   label: "Functions"        },
  { id: "params", label: "Issue Parameters" },
];

function FunctionParamsTable() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [paramSearch,    setParamSearch]    = useState("");

  const severities = ["all", "critical", "high", "medium", "low", "info"];
  const paramCounts = severities.reduce((acc, s) => {
    acc[s] = s === "all"
      ? FUNCTION_ISSUE_PARAMS.length
      : FUNCTION_ISSUE_PARAMS.filter(p => p.severity === s).length;
    return acc;
  }, {});

  const displayed = FUNCTION_ISSUE_PARAMS
    .filter(p => severityFilter === "all" || p.severity === severityFilter)
    .filter(p => {
      if (!paramSearch) return true;
      const q = paramSearch.toLowerCase();
      return p.parameter.toLowerCase().includes(q)
          || p.description.toLowerCase().includes(q)
          || p.code.toLowerCase().includes(q);
    });

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: 8 }}>
        <CardTitle icon="list-check">FN-001 – FN-018 · Function scan parameters</CardTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 3 }}>
            {severities.map(lvl => {
              const s      = SEVERITY_STYLES[lvl];
              const active = severityFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 9px", borderRadius: 20, fontSize: 11,
                    fontFamily: "inherit", cursor: "pointer", border: "0.5px solid",
                    transition: "all 0.15s",
                    background:  active ? (s ? s.bg    : "#111") : "transparent",
                    color:       active ? (s ? s.color : "#fff") : "#888",
                    borderColor: active ? (s ? s.color : "#333") : "#e0ddd6",
                    fontWeight:  active ? 600 : 400,
                  }}
                >
                  {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  <span style={{ fontSize: 10, background: "rgba(0,0,0,0.08)", padding: "0 4px", borderRadius: 99 }}>
                    {paramCounts[lvl]}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f4f0", border: "0.5px solid #e0ddd6", borderRadius: 8, padding: "0 10px", minWidth: 180 }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 13, color: "#aaa" }} />
            <input
              type="text" value={paramSearch} onChange={e => setParamSearch(e.target.value)}
              placeholder="Search parameters…"
              style={{ border: "none", background: "none", padding: "6px 0", fontSize: 12, flex: 1, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </div>

      {displayed.map(p => <IssueParamRow key={p.code} p={p} />)}

      {displayed.length === 0 && (
        <div style={{ padding: "1.5rem 0", textAlign: "center", fontSize: 13, color: "#aaa" }}>
          No parameters match the current filters.
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <Btn small onClick={() => window.sendPrompt?.("Scan all custom functions against the FN-001 to FN-018 parameter checklist and report any violations found")}>Run FN scan ↗</Btn>
      </div>
    </Card>
  );
}

const FUNC_TYPE_TABS = [
  { id: "all",           label: "All",           apiType: null         },
  { id: "standalone",    label: "Standalone",     apiType: "standalone"    },
  { id: "workflow",      label: "Workflow",        apiType: "workflow"      },
  { id: "automation",    label: "Automation",      apiType: "automation"    },
  { id: "custom_button", label: "Custom Button",   apiType: "custom_button" },
  { id: "related_list",  label: "Related List",    apiType: "related_list"  },
];

const TYPE_PILL_VARIANT = {
  standalone:    "blue",
  workflow:      "green",
  automation:    "purple",
  custom_button: "amber",
  related_list:  "gray",
  connect:       "blue",
};

export function Functions({ functions, openModal, fetchFunctionsByType }) {
  const [pageTab,      setPageTab]      = useState("list");
  const [typeTab,    setTypeTab]    = useState("all");
  const [query,      setQuery]      = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");

  // Cache: { standalone: [...], workflow: [...], ... }
  const [typeCache,   setTypeCache]   = useState({});
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeError,   setTypeError]   = useState(null);

  const ok     = functions.filter(f => f.status === "ok").length;
  const errors = functions.filter(f => f.status === "error").length;
  const unused = functions.filter(f => f.status === "unused").length;

  async function loadType(apiType) {
    if (typeCache[apiType] !== undefined) return; // already fetched (even if empty)
    setTypeLoading(true);
    setTypeError(null);
    try {
      const rows = await fetchFunctionsByType(apiType);
      setTypeCache(prev => ({ ...prev, [apiType]: rows }));
    } catch (err) {
      setTypeError(err.message);
    } finally {
      setTypeLoading(false);
    }
  }

  function handleTypeTab(id) {
    setTypeTab(id);
    setQuery("");
    setStatusFilter("all");
    const tab = FUNC_TYPE_TABS.find(t => t.id === id);
    if (tab?.apiType) loadType(tab.apiType);
  }

  // Source of truth for current tab
  const activeTab  = FUNC_TYPE_TABS.find(t => t.id === typeTab);
  const sourceRows = activeTab?.apiType
    ? (typeCache[activeTab.apiType] ?? [])
    : functions;

  const langOptions   = [...new Set(sourceRows.map(f => f.lang).filter(Boolean))];
  const displayedRows = sourceRows
    .filter(f => statusFilter === "all" || f.status === statusFilter)
    .filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()))
    .filter(f => langFilter === "all" || f.lang === langFilter);

  const showTypeCol = typeTab === "all"; // show Type column only on All tab

  return (
    <div>
      <PageHeader title="Functions" sub={`${functions.length} functions loaded · ${errors} errors · ${unused} unused`}>
        {pageTab === "list" && (
          <Btn primary onClick={() => openModal("add-function")}>
            <i className="ti ti-plus" aria-hidden="true" /> New function
          </Btn>
        )}
      </PageHeader>

      <InnerTabs tabs={FN_PAGE_TABS} active={pageTab} onChange={setPageTab} />

      {pageTab === "params" && <FunctionParamsTable />}
      {pageTab === "list" && (<>

      <StatsRow>
        <StatCard value={functions.length} label="Total"    />
        <StatCard value={errors}           label="Errors"   />
        <StatCard value={unused}           label="Unused"   />
        <StatCard value={ok}               label="Healthy"  />
      </StatsRow>

      <Card>
        <CardTitle icon="code">Functions registry</CardTitle>

        {/* Type tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: "0.75rem", borderBottom: "0.5px solid #e0ddd6", flexWrap: "wrap" }}>
          {FUNC_TYPE_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => handleTypeTab(t.id)}
              style={{
                padding: "7px 14px", fontSize: 13, cursor: "pointer",
                background: "none", border: "none", fontFamily: "inherit",
                color: typeTab === t.id ? "#0F6E56" : "#888",
                borderBottom: typeTab === t.id ? "2px solid #1D9E75" : "2px solid transparent",
                fontWeight: typeTab === t.id ? 500 : 400,
                marginBottom: -1, transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              {t.label}
              {typeCache[t.apiType] !== undefined && (
                <span style={{ marginLeft: 5, fontSize: 11, color: "#aaa" }}>
                  {typeCache[t.apiType].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 8, background: "#f5f4f0", border: "0.5px solid #e0ddd6", borderRadius: 8, padding: "0 10px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 15, color: "#888" }} />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search functions…"
              style={{ border: "none", background: "none", padding: "8px 0", fontSize: 13, flex: 1, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: "0 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer" }}
          >
            <option value="all">All statuses</option>
            <option value="ok">OK</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="unused">Unused</option>
          </select>
          <select
            value={langFilter} onChange={e => setLangFilter(e.target.value)}
            style={{ padding: "0 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer" }}
          >
            <option value="all">All languages</option>
            {langOptions.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Loading / error states */}
        {typeLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem 0", color: "#888", fontSize: 13 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: "pulse 1.2s ease-in-out infinite" }} />
            Fetching {activeTab?.label} functions from Zoho…
          </div>
        )}
        {typeError && (
          <div style={{ background: "#FCEBEB", border: "0.5px solid #f5c6c6", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#A32D2D", marginBottom: "0.75rem" }}>
            <i className="ti ti-alert-circle" aria-hidden="true" style={{ marginRight: 6 }} />
            {typeError}
          </div>
        )}

        {!typeLoading && (
          <Table
            columns={[
              "Function name", "Module", "Language",
              ...(showTypeCol ? ["Type"] : []),
              "Called by", "Last run", "Status",
            ]}
            rows={displayedRows.map(fn => [
              <code style={{ fontSize: 12 }}>{fn.name}</code>,
              fn.module, fn.lang,
              ...(showTypeCol ? [
                <Pill variant={TYPE_PILL_VARIANT[fn.type] || "gray"}>{fn.typeLabel || fn.type}</Pill>
              ] : []),
              `${fn.calledBy} workflow${fn.calledBy !== 1 ? "s" : ""}`,
              fn.lastRun,
              <StatusPill status={fn.status} />,
            ])}
          />
        )}

        {!typeLoading && displayedRows.length === 0 && !typeError && (
          <div style={{ fontSize: 13, color: "#aaa", padding: "1rem 0", textAlign: "center" }}>
            {activeTab?.apiType && typeCache[activeTab.apiType] === undefined
              ? "Click a tab to load functions from Zoho"
              : "No functions match the current filters"}
          </div>
        )}

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Btn small onClick={() => window.sendPrompt?.("Debug all functions with errors and explain what is causing them")}>Debug errors ↗</Btn>
          <Btn small onClick={() => window.sendPrompt?.("Should I delete the unused CRM functions? What is the impact assessment?")}>Clean unused ↗</Btn>
        </div>
      </Card>
      </>)}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 6. AUDIT
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_LEVELS = ["all", "critical", "high", "medium", "low", "info"];

export function Audit({ auditIssues, passedChecks, resolveIssue }) {
  const [severityFilter, setSeverityFilter] = useState("all");

  const counts = {
    all:      auditIssues.length,
    critical: auditIssues.filter(i => i.severity === "critical").length,
    high:     auditIssues.filter(i => i.severity === "high").length,
    medium:   auditIssues.filter(i => i.severity === "medium").length,
    low:      auditIssues.filter(i => i.severity === "low").length,
    info:     auditIssues.filter(i => i.severity === "info").length,
  };

  const filtered = severityFilter === "all"
    ? auditIssues
    : auditIssues.filter(i => i.severity === severityFilter);

  return (
    <div>
      <PageHeader title="Audit log" sub={`${auditIssues.length} active issues · Last full scan Jun 4, 2026 02:30 AM`}>
        <Btn primary onClick={() => window.sendPrompt?.("Run a comprehensive CRM audit now and list all issues found with severity levels and recommended fixes")}>
          <i className="ti ti-player-play" aria-hidden="true" /> Run full audit ↗
        </Btn>
      </PageHeader>

      <StatsRow>
        <StatCard value={counts.critical} label="Critical" />
        <StatCard value={counts.high}     label="High" />
        <StatCard value={counts.medium}   label="Medium" />
        <StatCard value={counts.low}      label="Low" />
        <StatCard value={counts.info}     label="Info" />
        <StatCard value={passedChecks.length} label="Passed checks" />
      </StatsRow>

      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: 8 }}>
          <CardTitle icon="alert-triangle">Issues</CardTitle>

          {/* Severity filter pills */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {SEVERITY_LEVELS.map(lvl => {
              const s      = SEVERITY_STYLES[lvl];
              const active = severityFilter === lvl;
              const n      = counts[lvl];
              return (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 10px", borderRadius: 20, fontSize: 12,
                    fontFamily: "inherit", cursor: "pointer", border: "0.5px solid",
                    transition: "all 0.15s",
                    background:   active ? (s ? s.bg   : "#111") : "transparent",
                    color:        active ? (s ? s.color : "#fff") : "#888",
                    borderColor:  active ? (s ? s.color : "#333") : "#e0ddd6",
                    fontWeight:   active ? 600 : 400,
                  }}
                >
                  {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  <span style={{
                    fontSize: 11,
                    background: active ? "rgba(0,0,0,0.10)" : "#f0f0ed",
                    color:      active ? "inherit" : "#aaa",
                    padding: "0px 5px", borderRadius: 99,
                  }}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filtered.map(issue => {
          const s = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.info;
          return (
            <div key={issue.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "0.5px solid #e0ddd6" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                <i className={`ti ti-${s.icon}`} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <IssueCode code={issue.code} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{issue.title}</span>
                </div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 4 }}>{issue.desc}</div>
                <div style={{ fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span>{issue.meta}</span>
                  <Pill variant={SEVERITY_PILL[issue.severity] || "gray"}>{issue.severity}</Pill>
                  <span style={{ color: "#bbb" }}>·</span>
                  <span>{SEVERITY_ACTION[issue.severity]}</span>
                  {issue.fixPrompt && (
                    <Btn small onClick={() => window.sendPrompt?.(issue.fixPrompt)}>
                      {issue.severity === "critical" ? "Auto-fix ↗" : "How to fix ↗"}
                    </Btn>
                  )}
                  {resolveIssue && (
                    <Btn small onClick={() => resolveIssue(issue.id)}>Mark resolved</Btn>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: "1.5rem 0", fontSize: 13, color: "#888", textAlign: "center" }}>
            {auditIssues.length === 0 ? "✓ All issues resolved" : `No ${severityFilter} issues`}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle icon="check">Passed checks ({passedChecks.length})</CardTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {passedChecks.map(c => <Pill key={c} variant="green">{c}</Pill>)}
          <Btn small onClick={() => window.sendPrompt?.("Show me the full list of all CRM audit passed checks with details")}>See all ↗</Btn>
        </div>
      </Card>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 7. OPTIONS
// ─────────────────────────────────────────────────────────────────────────────
export function Options({ dealStage, leadSource, openModal }) {
  return (
    <div>
      <PageHeader title="Options & picklists" sub="Manage dropdown values, stages, and config options">
        <Btn primary onClick={() => openModal("add-option")}>
          <i className="ti ti-plus" aria-hidden="true" /> Add option
        </Btn>
      </PageHeader>
      <Split>
        <Card>
          <CardTitle icon="list-check">Deal stage</CardTitle>
          <Table
            columns={["Option", "Probability", "Order", "Status"]}
            rows={dealStage.map(o => [o.label, o.prob != null ? `${o.prob}%` : "—", o.order ?? "—", <StatusPill status={o.status} />])}
          />
        </Card>
        <Card>
          <CardTitle icon="list-check">Lead source</CardTitle>
          <Table
            columns={["Option", "Score mapping", "Status"]}
            rows={leadSource.map(o => [o.label, o.score, <StatusPill status={o.status} />])}
          />
          <div style={{ marginTop: 10 }}>
            <Btn small onClick={() => window.sendPrompt?.("Suggest new lead source options for our CRM based on modern B2B acquisition channels")}>Suggest options ↗</Btn>
          </div>
        </Card>
      </Split>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// ZIA CHAT
// ─────────────────────────────────────────────────────────────────────────────
const ZIA_SUGGESTIONS = [
  "How many active workflows do I have?",
  "Which fields are undocumented?",
  "Show me all functions with errors",
  "What's the deal conversion rate this month?",
];

export function ZiaChat({ ziaMessages, ziaLoading, sendZiaMessage }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ziaMessages, ziaLoading]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    sendZiaMessage(text);
    setInput("");
  }

  return (
    <div>
      <PageHeader
        title="Zia AI Assistant"
        sub="Ask Zia about your CRM data — insights, predictions, and analysis"
      />

      <Card>
        {/* Message history */}
        <div style={{ minHeight: 360, maxHeight: "55vh", overflowY: "auto", paddingBottom: 8 }}>
          {ziaMessages.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Ask Zia anything</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
                Zia can answer questions about your CRM data, workflows, fields, and more.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {ZIA_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendZiaMessage(s)}
                    style={{
                      padding: "6px 14px", borderRadius: 20, border: "0.5px solid #e0ddd6",
                      background: "#f5f4f0", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                      color: "#555", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#E1F5EE"; e.currentTarget.style.borderColor = "#1D9E75"; e.currentTarget.style.color = "#0F6E56"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f5f4f0"; e.currentTarget.style.borderColor = "#e0ddd6"; e.currentTarget.style.color = "#555"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {ziaMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              {msg.role === "zia" && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "#E1F5EE", color: "#0F6E56",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, flexShrink: 0, marginRight: 8, alignSelf: "flex-end",
                }}>
                  <i className="ti ti-robot" aria-hidden="true" />
                </div>
              )}
              <div style={{
                maxWidth: "72%", padding: "9px 14px", borderRadius: 12,
                background: msg.role === "user" ? "#1D9E75" : "#f5f4f0",
                color: msg.role === "user" ? "#fff" : "#333",
                fontSize: 13, lineHeight: 1.6,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {ziaLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#E1F5EE", color: "#0F6E56",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>
                <i className="ti ti-robot" aria-hidden="true" />
              </div>
              <div style={{ padding: "9px 14px", borderRadius: 12, background: "#f5f4f0", fontSize: 13, color: "#888" }}>
                Zia is thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ borderTop: "0.5px solid #e0ddd6", paddingTop: 12, display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask Zia anything about your CRM…"
            style={{
              flex: 1, padding: "9px 14px", borderRadius: 8,
              border: "0.5px solid #e0ddd6", fontSize: 13,
              fontFamily: "inherit", outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "#1D9E75"}
            onBlur={e => e.target.style.borderColor = "#e0ddd6"}
          />
          <Btn primary onClick={handleSend}>
            <i className="ti ti-send" aria-hidden="true" /> Send
          </Btn>
        </div>
      </Card>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 8. BLUEPRINTS · SCHEDULED REPORTS
// ─────────────────────────────────────────────────────────────────────────────

function BlueprintsTab({ modules }) {
  const [selectedModule, setSelectedModule] = useState("Deals");
  const [blueprint, setBlueprint]           = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  const moduleOptions = modules?.length
    ? modules.map(m => m.name)
    : ["Leads", "Deals", "Contacts", "Accounts"];

  async function loadBlueprint() {
    setLoading(true); setError(null); setBlueprint(null);
    try {
      const res  = await fetch(`/api/zoho/blueprints/${encodeURIComponent(selectedModule)}`);
      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
      setBlueprint(data.blueprint || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const bp          = blueprint;
  const nodes       = bp?.nodes       ?? [];
  const transitions = bp?.transitions ?? [];

  return (
    <Card>
      <CardTitle icon="route">Blueprint explorer</CardTitle>

      {/* Module selector + load */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <label style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Module:</label>
        <select
          value={selectedModule}
          onChange={e => setSelectedModule(e.target.value)}
          style={{ padding: "5px 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer" }}
        >
          {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <Btn primary small onClick={loadBlueprint}>
          <i className="ti ti-refresh" aria-hidden="true" /> Load Blueprint
        </Btn>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem 0", color: "#888", fontSize: 13 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", display: "inline-block", animation: "pulse 1.2s ease-in-out infinite" }} />
          Fetching blueprint for {selectedModule}…
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", border: "0.5px solid #f5c6c6", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#A32D2D", marginBottom: "0.75rem" }}>
          <i className="ti ti-alert-circle" aria-hidden="true" style={{ marginRight: 6 }} />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !bp && !error && (
        <div style={{ padding: "2.5rem 0", textAlign: "center", color: "#aaa", fontSize: 13 }}>
          <i className="ti ti-route" aria-hidden="true" style={{ fontSize: 32, display: "block", marginBottom: 10 }} />
          Select a module and click "Load Blueprint" to view its process flow.
        </div>
      )}

      {/* Blueprint result */}
      {!loading && bp && (
        <>
          {/* Process info bar */}
          <div style={{ background: "#f0faf6", border: "0.5px solid #c8eed9", borderRadius: 8, padding: "10px 16px", marginBottom: "1rem", display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Blueprint name",  val: bp.process_info?.name               || "—" },
              { label: "Tracked field",   val: bp.process_info?.field?.api_name    || "—" },
              { label: "States",          val: nodes.length       || "—" },
              { label: "Transitions",     val: transitions.length || "—" },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.val}</div>
              </div>
            ))}
          </div>

          {/* State pills */}
          {nodes.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>States</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {nodes.map(n => (
                  <Pill key={n.id} variant="blue">{n.data?.display_label || n.id}</Pill>
                ))}
              </div>
            </div>
          )}

          {/* Transitions table */}
          {transitions.length > 0 ? (
            <Table
              columns={["Transition", "From state", "To state", "Checkpoints"]}
              rows={transitions.map(t => {
                const fromNode = nodes.find(n => n.id === t.from_node?.id);
                const toNode   = nodes.find(n => n.id === t.to_node?.id);
                const checks   = t.actions?.checkpoints?.length ?? 0;
                return [
                  <b>{t.name || t.data?.display_label || t.id}</b>,
                  fromNode?.data?.display_label || t.from_node?.id || "—",
                  toNode?.data?.display_label   || t.to_node?.id   || "—",
                  checks > 0
                    ? <Pill variant="green">{checks} checkpoint{checks !== 1 ? "s" : ""}</Pill>
                    : <span style={{ color: "#ccc" }}>—</span>,
                ];
              })}
            />
          ) : (
            <pre style={{ fontSize: 11, color: "#555", background: "#f5f4f0", padding: 12, borderRadius: 8, overflowX: "auto", lineHeight: 1.6, maxHeight: 320 }}>
              {JSON.stringify(bp, null, 2)}
            </pre>
          )}

          <div style={{ marginTop: 10 }}>
            <Btn small onClick={() => window.sendPrompt?.(`Analyze the ${selectedModule} CRM blueprint and suggest improvements to the process flow and transition criteria`)}>Analyse with AI ↗</Btn>
          </div>
        </>
      )}
    </Card>
  );
}

function ScheduledReportsTab({ reports, onCreate, onDelete, onRun, modules }) {
  const [showForm,   setShowForm]   = useState(false);
  const [creating,   setCreating]   = useState(false);
  const [runningId,  setRunningId]  = useState(null);
  const [form, setForm] = useState({ name: "", frequency: "weekly", reportType: "full-audit", modules: [] });

  const moduleOptions = modules?.length ? modules.map(m => m.name) : ["Leads", "Deals", "Contacts", "Accounts"];

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await onCreate(form);
      setForm({ name: "", frequency: "weekly", reportType: "full-audit", modules: [] });
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleRun(id) {
    setRunningId(id);
    try { await onRun(id); } finally { setRunningId(null); }
  }

  function fmt(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }

  const FREQ_VARIANT = { daily: "amber", weekly: "green", monthly: "purple" };
  const TYPE_LABELS  = { "full-audit": "Full audit", "workflow-health": "Workflow health", "field-coverage": "Field coverage", "blueprint-status": "Blueprint status" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
        <Btn primary onClick={() => setShowForm(v => !v)}>
          <i className="ti ti-plus" aria-hidden="true" /> New report
        </Btn>
      </div>

      {showForm && (
        <Card>
          <CardTitle icon="calendar-plus">New scheduled report</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#555", display: "block", marginBottom: 4 }}>Report name *</label>
              <input
                value={form.name}
                onChange={e => setField("name", e.target.value)}
                placeholder="e.g. Weekly CRM health check"
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                onFocus={e  => e.target.style.borderColor = "#1D9E75"}
                onBlur={e   => e.target.style.borderColor = "#e0ddd6"}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#555", display: "block", marginBottom: 4 }}>Frequency</label>
              <select
                value={form.frequency}
                onChange={e => setField("frequency", e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer" }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#555", display: "block", marginBottom: 4 }}>Report type</label>
              <select
                value={form.reportType}
                onChange={e => setField("reportType", e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", cursor: "pointer" }}
              >
                <option value="full-audit">Full audit</option>
                <option value="workflow-health">Workflow health</option>
                <option value="field-coverage">Field coverage</option>
                <option value="blueprint-status">Blueprint status</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#555", display: "block", marginBottom: 4 }}>Modules (hold Ctrl to multi-select)</label>
              <select
                multiple
                value={form.modules}
                onChange={e => setField("modules", Array.from(e.target.selectedOptions, o => o.value))}
                style={{ width: "100%", padding: "4px", borderRadius: 8, border: "0.5px solid #e0ddd6", fontSize: 13, fontFamily: "inherit", background: "#fff", height: 76 }}
              >
                {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn primary onClick={handleCreate}>
              {creating ? "Creating…" : "Create report"}
            </Btn>
            <Btn onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle icon="calendar-stats">
          Scheduled reports
          <span style={{ marginLeft: 6, fontSize: 12, color: "#aaa", fontWeight: 400 }}>({reports.length})</span>
        </CardTitle>

        {reports.length === 0 ? (
          <div style={{ padding: "2.5rem 0", textAlign: "center", color: "#aaa", fontSize: 13 }}>
            <i className="ti ti-calendar-off" aria-hidden="true" style={{ fontSize: 32, display: "block", marginBottom: 10 }} />
            No scheduled reports yet. Create one to automate your CRM audits.
          </div>
        ) : (
          <Table
            columns={["Name", "Type", "Frequency", "Last run", "Next run", "Status", ""]}
            rows={reports.map(r => [
              <b>{r.name}</b>,
              <Pill variant="blue">{TYPE_LABELS[r.reportType] || r.reportType}</Pill>,
              <Pill variant={FREQ_VARIANT[r.frequency] || "gray"}>{r.frequency}</Pill>,
              fmt(r.lastRun),
              fmt(r.nextRun),
              <StatusPill status={r.status} />,
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => handleRun(r.id)}
                  title="Run now"
                  style={{ background: "none", border: "none", cursor: "pointer", color: runningId === r.id ? "#1D9E75" : "#ccc", padding: "2px 4px", fontSize: 15, borderRadius: 6 }}
                  onMouseEnter={e => { if (runningId !== r.id) e.currentTarget.style.color = "#1D9E75"; }}
                  onMouseLeave={e => { if (runningId !== r.id) e.currentTarget.style.color = "#ccc"; }}
                >
                  <i className="ti ti-player-play" aria-hidden="true" />
                </button>
                <button
                  onClick={() => { if (window.confirm(`Delete "${r.name}"?`)) onDelete(r.id); }}
                  title="Delete report"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "2px 4px", fontSize: 15, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#c0392b"}
                  onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
                >
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}

export function Blueprints({ modules, scheduledReports, createScheduledReport, deleteScheduledReport, runScheduledReport }) {
  const [activeTab, setActiveTab] = useState("blueprints");
  const TABS = [
    { id: "blueprints", label: "Blueprints"        },
    { id: "scheduled",  label: "Scheduled Reports" },
  ];

  const scheduledCount = scheduledReports?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Blueprints  ·  Scheduled Reports"
        sub="Process automation blueprints and recurring audit schedules"
      >
        {activeTab === "scheduled" && scheduledCount > 0 && (
          <span style={{ fontSize: 13, color: "#888" }}>{scheduledCount} report{scheduledCount !== 1 ? "s" : ""} active</span>
        )}
      </PageHeader>

      <InnerTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "blueprints" && <BlueprintsTab modules={modules} />}
      {activeTab === "scheduled"  && (
        <ScheduledReportsTab
          reports={scheduledReports || []}
          onCreate={createScheduledReport}
          onDelete={deleteScheduledReport}
          onRun={runScheduledReport}
          modules={modules}
        />
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 8. ROLES
// ─────────────────────────────────────────────────────────────────────────────
const PERM_MAP = { full: "Full", edit: "Edit", view: "View", none: "None" };
const PERM_VARIANT = { full: "green", edit: "blue", view: "gray", none: "red" };

export function Roles({ roles, roleMatrix }) {
  return (
    <div>
      <PageHeader title="Roles & access" sub="5 roles · 28 users">
        <Btn primary onClick={() => window.sendPrompt?.("Review CRM role permissions and identify any security concerns or overprivileged roles")}>Audit access ↗</Btn>
      </PageHeader>
      <Card>
        <CardTitle icon="users">Role permissions matrix</CardTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 500, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px", padding: "0 10px 8px", borderBottom: "0.5px solid #e0ddd6", width: 130 }}>Module</th>
                {roles.map(r => (
                  <th key={r} style={{ textAlign: "left", fontSize: 11, fontWeight: 500, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px", padding: "0 10px 8px", borderBottom: "0.5px solid #e0ddd6" }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map(row => (
                <tr key={row.module}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f4f0"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #e0ddd6" }}><b>{row.module}</b></td>
                  {row.perms.map((p, i) => (
                    <td key={i} style={{ padding: "9px 10px", borderBottom: "0.5px solid #e0ddd6" }}>
                      <Pill variant={PERM_VARIANT[p]}>{PERM_MAP[p]}</Pill>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
