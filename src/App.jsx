// ─── CRM Audit Studio · App.jsx ──────────────────────────────────────────────

import { useState } from "react";
import { useCRM } from "./hooks/useCRM";
import { Topbar, Sidebar } from "./components/Layout";
import Modal from "./components/Modal";
import {
  Overview, Modules, Workflows, Fields,
  Functions, Audit, Options, Roles, ZiaChat, Blueprints,
} from "./pages/Pages";

// ── MCP Connect Screen ────────────────────────────────────────────────────────
function ZohoLoginScreen({ error }) {
  const [mcpUrl,   setMcpUrl]   = useState("");
  const [mcpHov,   setMcpHov]   = useState(false);
  const [mcpState, setMcpState] = useState("idle"); // idle | saving | saved | error
  const [mcpError, setMcpError] = useState("");

  async function handleMcpSave() {
    const url = mcpUrl.trim();
    if (!url) return;
    setMcpState("saving");
    setMcpError("");
    try {
      const res  = await fetch("/api/mcp/configure", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to save");
      setMcpState("saved");
      // Reload so useCRM re-checks auth status and enters the dashboard
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMcpError(err.message);
      setMcpState("error");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f4f0",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "inherit",
    }}>
      {/* Logo */}
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 40 }}>
        Evo<span style={{ color: "#1D9E75" }}>Audit</span>
      </div>

      {/* Card */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "0.5px solid #e0ddd6",
        padding: "40px 48px", maxWidth: 440, width: "100%",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        textAlign: "center",
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "#E1F5EE", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600, color: "#111" }}>
          Connect via Zoho MCP
        </h2>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
          Paste your Zoho MCP endpoint URL to give EvoAudit live access to your CRM data.
        </p>

        {/* Server unreachable warning */}
        {error === "server_unreachable" && (
          <div style={{
            background: "#FFFBE6", border: "0.5px solid #f0d060",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: "#7a5c00", marginBottom: 20, textAlign: "left",
          }}>
            Backend not reachable. Run{" "}
            <code style={{ background: "#f5f4f0", padding: "1px 5px", borderRadius: 4 }}>npm run dev</code>{" "}
            to start both servers, then refresh.
          </div>
        )}

        {/* MCP URL input */}
        {mcpState === "saved" ? (
          <div style={{
            background: "#F0FAF5", border: "0.5px solid #a8dfc4",
            borderRadius: 8, padding: "12px 16px",
            fontSize: 13, color: "#0F6E56",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            MCP URL saved — loading your CRM…
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: mcpState === "error" ? 6 : 0 }}>
              <input
                type="text"
                placeholder="https://…zohomcp.in/mcp/…/message"
                value={mcpUrl}
                onChange={e => { setMcpUrl(e.target.value); setMcpState("idle"); setMcpError(""); }}
                onKeyDown={e => e.key === "Enter" && handleMcpSave()}
                style={{
                  flex: 1, padding: "9px 12px", borderRadius: 8,
                  border: `0.5px solid ${mcpState === "error" ? "#ffaaaa" : "#d0cdc6"}`,
                  fontSize: 13, outline: "none", background: "#fff",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleMcpSave}
                disabled={!mcpUrl.trim() || mcpState === "saving"}
                onMouseEnter={() => setMcpHov(true)}
                onMouseLeave={() => setMcpHov(false)}
                style={{
                  padding: "9px 16px", borderRadius: 8, border: "none",
                  background: !mcpUrl.trim() ? "#e8e6e0" : mcpHov ? "#0F6E56" : "#1D9E75",
                  color: !mcpUrl.trim() ? "#aaa" : "#fff",
                  fontSize: 13, fontWeight: 500,
                  cursor: !mcpUrl.trim() || mcpState === "saving" ? "default" : "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
              >
                {mcpState === "saving" ? "Saving…" : "Connect"}
              </button>
            </div>
            {mcpState === "error" && (
              <p style={{ fontSize: 12, color: "#c0392b", margin: "6px 0 0", textAlign: "left" }}>{mcpError}</p>
            )}
          </>
        )}

        {/* Where to get the URL */}
        <div style={{ marginTop: 28, textAlign: "left" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
            Where to find your MCP URL
          </p>
          <ol style={{ margin: 0, padding: "0 0 0 18px", fontSize: 13, color: "#666", lineHeight: 2 }}>
            <li>Go to <strong>zoho.com/mcp</strong></li>
            <li>Sign in and select your Zoho CRM org</li>
            <li>Copy the <strong>MCP Endpoint URL</strong></li>
            <li>Paste it above and click <strong>Connect</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ── Sync progress bar ─────────────────────────────────────────────────────────
const SYNC_STEPS = [
  { key: "modules",   label: "Modules"   },
  { key: "workflows", label: "Workflows" },
  { key: "fields",    label: "Fields"    },
  { key: "functions", label: "Functions" },
];

function SyncProgressBar({ syncProgress }) {
  if (!syncProgress?.active) return null;
  const done = syncProgress.done || {};
  const completedCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((completedCount / SYNC_STEPS.length) * 100);

  return (
    <div style={{
      marginBottom: "1rem", background: "#fff",
      border: "0.5px solid #c8eed9", borderRadius: 10,
      padding: "12px 16px",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: "#0F6E56", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: "#1D9E75",
            display: "inline-block", animation: "pulse 1.2s ease-in-out infinite",
          }} />
          Syncing live data from Zoho CRM
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#1D9E75" }}>{pct}%</span>
      </div>

      {/* Track */}
      <div style={{ background: "#e4f5ed", borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 10 }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg, #1D9E75 0%, #27c98f 50%, #1D9E75 100%)",
          backgroundSize: "200% 100%",
          animation: pct < 100 ? "progress-shimmer 1.8s linear infinite" : "none",
          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 16 }}>
        {SYNC_STEPS.map(step => (
          <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: done[step.key] ? "#0F6E56" : "#bbb", transition: "color 0.3s" }}>
            <i className={`ti ti-${done[step.key] ? "circle-check-filled" : "circle-dashed"}`} style={{ fontSize: 13 }} aria-hidden="true" />
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Loading splash ────────────────────────────────────────────────────────────
function LoadingSplash() {
  return (
    <div style={{
      minHeight: "100vh", background: "#f5f4f0",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center", color: "#888", fontSize: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 16, color: "#111" }}>
          Evo<span style={{ color: "#1D9E75" }}>Audit</span>
        </div>
        Connecting…
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const crm = useCRM();

  // Show loading splash while checking auth
  if (crm.authStatus.loading) return <LoadingSplash />;

  // Show login screen when not connected
  if (!crm.authStatus.connected) {
    return <ZohoLoginScreen error={crm.authStatus.error} />;
  }

  // ── Page router ──────────────────────────────────────────────────────────
  const PAGES = {
    overview:  <Overview  {...crm} />,
    modules:   <Modules   {...crm} />,
    workflows: <Workflows {...crm} />,
    fields:    <Fields    {...crm} />,
    functions: <Functions {...crm} />,
    blueprints: <Blueprints {...crm} />,
    audit:     <Audit     {...crm} />,
    options:   <Options   {...crm} />,
    roles:     <Roles     {...crm} />,
    zia:       <ZiaChat   {...crm} />,
  };

  const handleSave = async (data) => {
    const dispatch = {
      "add-module":   crm.addModule,
      "add-workflow": crm.addWorkflow,
      "add-field":    crm.addField,
      "add-function": crm.addFunction,
      "add-option":   crm.addOption,
    };
    await dispatch[crm.modalType]?.(data);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f5f4f0" }}>
      <Topbar
        activePage={crm.activePage}
        onNavigate={crm.setActivePage}
        onOpenModal={crm.openModal}
        counts={crm.counts}
        authStatus={crm.authStatus}
        dataLoading={crm.dataLoading}
        onDisconnect={crm.disconnect}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          activePage={crm.activePage}
          onNavigate={crm.setActivePage}
          counts={crm.counts}
        />
        <main style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          <SyncProgressBar syncProgress={crm.syncProgress} />
          {PAGES[crm.activePage] ?? PAGES.overview}
        </main>
      </div>

      <Modal
        isOpen={!!crm.modalType}
        type={crm.modalType}
        onClose={crm.closeModal}
        onSave={handleSave}
        selectedModule={crm.selectedModule}
        modules={crm.modules}
      />
    </div>
  );
}
