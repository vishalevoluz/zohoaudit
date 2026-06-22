// ─── CRM Audit Studio · Topbar.jsx ───────────────────────────────────────────

import { useState } from "react";

const TABS = [
  { id: "overview",   icon: "layout-dashboard", label: "Overview" },
  { id: "modules",    icon: "box",               label: "Modules" },
  { id: "workflows",  icon: "git-branch",        label: "Workflows" },
  { id: "fields",     icon: "table",             label: "Fields" },
  { id: "functions",  icon: "code",              label: "Functions"   },
  { id: "blueprints", icon: "route",             label: "Blueprints"  },
  { id: "audit",      icon: "shield-check",      label: "Audit"       },
  { id: "zia",        icon: "robot",             label: "Zia AI"      },
];

function TopBtn({ children, primary, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 12px", fontSize: 13, borderRadius: 8,
        border: "0.5px solid",
        cursor: "pointer", fontFamily: "inherit",
        background: primary ? (hov ? "#0F6E56" : "#1D9E75") : (hov ? "#f0f0ed" : "transparent"),
        color: primary ? "#fff" : "#333",
        borderColor: primary ? (hov ? "#0F6E56" : "#1D9E75") : "#ccc",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function McpPanel({ onClose }) {
  const [url, setUrl]       = useState("");
  const [state, setState]   = useState("idle"); // idle | saving | saved | error
  const [errMsg, setErrMsg] = useState("");

  async function save() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setState("saving");
    setErrMsg("");
    try {
      const res  = await fetch("/api/mcp/configure", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      setState("saved");
    } catch (err) {
      setErrMsg(err.message);
      setState("error");
    }
  }

  return (
    <div style={{
      position: "absolute", top: 48, right: 8, zIndex: 200,
      background: "#fff", border: "0.5px solid #e0ddd6",
      borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
      padding: "16px 18px", width: 320,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#111" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Zoho MCP
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, lineHeight: 1, padding: 2 }}>×</button>
      </div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10, lineHeight: 1.5 }}>
        Paste your endpoint URL from{" "}
        <a href="https://www.zoho.com/mcp/" target="_blank" rel="noreferrer" style={{ color: "#1D9E75", textDecoration: "none" }}>zoho.com/mcp</a>
        {" "}to connect Claude AI directly to your CRM.
      </p>

      {state === "saved" ? (
        <div style={{
          background: "#F0FAF5", border: "0.5px solid #a8dfc4",
          borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#0F6E56",
          display: "flex", alignItems: "center", gap: 7,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved to <code style={{ background: "#d6f0e4", padding: "1px 4px", borderRadius: 3, fontSize: 11 }}>.mcp.json</code>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              placeholder="https://mcp.zoho.com/..."
              value={url}
              onChange={e => { setUrl(e.target.value); setState("idle"); setErrMsg(""); }}
              onKeyDown={e => e.key === "Enter" && save()}
              autoFocus
              style={{
                flex: 1, padding: "7px 9px", borderRadius: 7,
                border: `0.5px solid ${state === "error" ? "#ffaaaa" : "#ccc"}`,
                fontSize: 12, outline: "none", fontFamily: "inherit",
              }}
            />
            <button
              onClick={save}
              disabled={!url.trim() || state === "saving"}
              style={{
                padding: "7px 12px", borderRadius: 7, border: "none",
                background: !url.trim() ? "#e8e6e0" : "#1D9E75",
                color: !url.trim() ? "#aaa" : "#fff",
                fontSize: 12, fontWeight: 500, cursor: !url.trim() ? "default" : "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              {state === "saving" ? "…" : "Save"}
            </button>
          </div>
          {state === "error" && (
            <p style={{ fontSize: 11, color: "#c0392b", marginTop: 5 }}>{errMsg}</p>
          )}
        </>
      )}
    </div>
  );
}

export function Topbar({ activePage, onNavigate, onOpenModal, counts, authStatus, dataLoading, onDisconnect }) {
  const [disconnectHov, setDisconnectHov] = useState(false);
  const [mcpOpen, setMcpOpen]             = useState(false);
  const orgName = authStatus?.org?.company_name || authStatus?.org?.primary_email || "Zoho CRM";

  return (
    <div style={{
      height: 52, background: "#fff",
      borderBottom: "0.5px solid #e0ddd6",
      display: "flex", alignItems: "center",
      padding: "0 1rem", gap: 12,
      position: "sticky", top: 0, zIndex: 50,
    }} onClick={e => { if (mcpOpen && !e.target.closest('[data-mcp]')) setMcpOpen(false); }}>
      {/* Logo */}
      <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: -0.3, flexShrink: 0 }}>
        Evo<span style={{ color: "#1D9E75" }}>Audit</span>
      </span>

      {/* Page tabs */}
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", fontSize: 13, borderRadius: 8,
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: activePage === tab.id ? "#f0f0ed" : "transparent",
              color: activePage === tab.id ? "#111" : "#666",
              fontWeight: activePage === tab.id ? 500 : 400,
              transition: "all 0.15s",
            }}
          >
            <i className={`ti ti-${tab.icon}`} aria-hidden="true" />
            {tab.label}
            {tab.id === "audit" && counts?.issues > 0 && (
              <span style={{ background: "#FAEEDA", color: "#633806", fontSize: 11, fontWeight: 500, padding: "1px 7px", borderRadius: 999 }}>
                {counts.issues}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div data-mcp style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto", position: "relative" }}>
        {/* Connected org pill */}
        {authStatus?.connected && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 8,
            border: "0.5px solid #d0f0e6", background: "#f0faf6",
            fontSize: 12, color: "#0F6E56",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0, animation: dataLoading ? "pulse 1.2s infinite" : "none" }} />
            {dataLoading ? "Loading…" : orgName}
          </div>
        )}

        {/* MCP button */}
        <button
          onClick={() => setMcpOpen(o => !o)}
          title="Configure Zoho MCP"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 8, cursor: "pointer",
            border: `0.5px solid ${mcpOpen ? "#1D9E75" : "#ccc"}`,
            background: mcpOpen ? "#f0faf6" : "transparent",
            color: mcpOpen ? "#1D9E75" : "#555",
            fontSize: 12, fontWeight: 500, fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          MCP
        </button>

        {/* MCP panel */}
        {mcpOpen && <McpPanel onClose={() => setMcpOpen(false)} />}

        <TopBtn onClick={() => onOpenModal("add-module")}>
          <i className="ti ti-plus" aria-hidden="true" /> Add
        </TopBtn>

        <TopBtn primary onClick={() => window.sendPrompt?.("Run a full CRM audit and give me a detailed health report with recommendations")}>
          <i className="ti ti-player-play" aria-hidden="true" /> Run Audit ↗
        </TopBtn>

        {/* Disconnect */}
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            onMouseEnter={() => setDisconnectHov(true)}
            onMouseLeave={() => setDisconnectHov(false)}
            title="Disconnect Zoho"
            style={{
              display: "inline-flex", alignItems: "center", padding: "5px 8px",
              borderRadius: 8, border: "0.5px solid #e0ddd6",
              background: disconnectHov ? "#fff0f0" : "transparent",
              color: disconnectHov ? "#c0392b" : "#888",
              cursor: "pointer", fontSize: 13, fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            <i className="ti ti-logout" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}


// ─── CRM Audit Studio · Sidebar.jsx ──────────────────────────────────────────

function NavItem({ icon, label, badge, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "7px 8px", borderRadius: 8, fontSize: 13,
        cursor: "pointer", border: "none", width: "100%", textAlign: "left",
        fontFamily: "inherit",
        background: active ? "#E1F5EE" : hov ? "#f5f4f0" : "transparent",
        color: active ? "#0F6E56" : hov ? "#111" : "#666",
        fontWeight: active ? 500 : 400,
        transition: "all 0.15s",
      }}
    >
      <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 15, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{
          background: active ? "#9FE1CB" : "#f0f0ed",
          color: active ? "#085041" : "#888",
          fontSize: 11, padding: "1px 7px", borderRadius: 999,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 500, color: "#aaa", letterSpacing: "0.8px", textTransform: "uppercase", padding: "0 8px", marginBottom: 4, marginTop: 4 }}>
      {children}
    </div>
  );
}

export function Sidebar({ activePage, onNavigate, counts }) {
  return (
    <div style={{
      width: 220, background: "#fff",
      borderRight: "0.5px solid #e0ddd6",
      padding: "12px 8px", overflowY: "auto", flexShrink: 0,
    }}>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Navigation</SectionLabel>
        <NavItem icon="layout-dashboard" label="Overview"   active={activePage === "overview"}   onClick={() => onNavigate("overview")} />
        <NavItem icon="box"              label="Modules"    badge={counts?.modules}   active={activePage === "modules"}    onClick={() => onNavigate("modules")} />
        <NavItem icon="git-branch"       label="Workflows"  badge={counts?.workflows} active={activePage === "workflows"}  onClick={() => onNavigate("workflows")} />
        <NavItem icon="table"            label="Fields"     badge={counts?.fields}    active={activePage === "fields"}     onClick={() => onNavigate("fields")} />
        <NavItem icon="code"             label="Functions"  badge={counts?.functions} active={activePage === "functions"}  onClick={() => onNavigate("functions")} />
        <NavItem icon="route"            label="Blueprints"                            active={activePage === "blueprints"} onClick={() => onNavigate("blueprints")} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Audit &amp; Config</SectionLabel>
        <NavItem icon="shield-check"   label="Audit Log"      badge={counts?.issues} active={activePage === "audit"}   onClick={() => onNavigate("audit")} />
        <NavItem icon="settings-2"     label="Options"                               active={activePage === "options"} onClick={() => onNavigate("options")} />
        <NavItem icon="users"          label="Roles &amp; Access"                     active={activePage === "roles"}   onClick={() => onNavigate("roles")} />
        <NavItem icon="robot"          label="Zia AI Chat"                            active={activePage === "zia"}     onClick={() => onNavigate("zia")} />
      </div>
      <div>
        <SectionLabel>Reports</SectionLabel>
        <NavItem icon="chart-bar"         label="Coverage ↗"      onClick={() => window.sendPrompt?.("Generate a CRM coverage report showing which modules, workflows and fields are fully documented vs incomplete")} />
        <NavItem icon="topology-star-3"   label="Dependencies ↗"  onClick={() => window.sendPrompt?.("Show me a dependency map of all CRM workflows and functions")} />
        <NavItem icon="download"          label="Export ↗"         onClick={() => window.sendPrompt?.("Export the full CRM audit as a structured JSON report")} />
      </div>
    </div>
  );
}
