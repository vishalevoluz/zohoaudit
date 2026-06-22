// ─── CRM Audit Studio · WorkflowCanvas.jsx ───────────────────────────────────
// Renders a horizontal chain of workflow step nodes.
//
// Props:
//   steps   — array of { id, label, type }
//             type: "trigger" | "condition" | "action" | "end"
//   name    — workflow display name (optional header)
//   status  — "active" | "inactive" | "draft" (optional pill)

import { StatusPill } from "./UI";

// Color tokens per node type
const NODE_STYLES = {
  trigger:   { bg: "#E1F5EE", border: "#5DCAA5", color: "#085041" },
  condition: { bg: "#FAEEDA", border: "#FAC775", color: "#633806" },
  action:    { bg: "#E6F1FB", border: "#85B7EB", color: "#0C447C" },
  end:       { bg: "#F1EFE8", border: "#B4B2A9", color: "#444441" },
};

function WorkflowNode({ step, onClick }) {
  const s = NODE_STYLES[step.type] || NODE_STYLES.action;
  return (
    <div style={{ textAlign: "center", flexShrink: 0 }}>
      <div
        onClick={onClick}
        title={`Click to learn more about this ${step.type} step`}
        style={{
          background: s.bg, border: `0.5px solid ${s.border}`, color: s.color,
          borderRadius: 8, padding: "8px 12px",
          fontSize: 12, fontWeight: 500,
          minWidth: 100, display: "inline-block",
          cursor: "pointer", transition: "all 0.15s",
          userSelect: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(0.95)"; }}
        onMouseLeave={e => { e.currentTarget.style.filter = ""; }}
      >
        {step.label}
        <span style={{ display: "block", fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.75, textTransform: "capitalize" }}>
          {step.type}
        </span>
      </div>
    </div>
  );
}

export default function WorkflowCanvas({ steps = [], name, status }) {
  const handleNodeClick = (step) => {
    window.sendPrompt?.(`Explain the "${step.label}" ${step.type} step in a CRM workflow — what does it do, when does it fire, and what are common configurations?`);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Optional header row */}
      {name && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
          {status && <StatusPill status={status} />}
        </div>
      )}

      {/* Canvas */}
      <div style={{
        background: "#f5f4f0",
        border: "0.5px solid #e0ddd6",
        borderRadius: 12,
        padding: "1.5rem",
        overflowX: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "nowrap", minWidth: "min-content" }}>
          {steps.map((step, i) => (
            <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
              <WorkflowNode step={step} onClick={() => handleNodeClick(step)} />
              {i < steps.length - 1 && (
                <span style={{ padding: "0 4px", color: "#aaa", fontSize: 16, flexShrink: 0 }}>→</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#aaa" }}>Click any node to learn more</div>
      </div>
    </div>
  );
}
