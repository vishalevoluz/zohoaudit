// ─── CRM Audit Studio · Modal.jsx ────────────────────────────────────────────
// Renders an overlay with the appropriate form based on `type` prop.
// Parent controls open state; calls onSave(data) or onClose().
//
// Supported types:
//   "add-module" | "add-workflow" | "add-field" | "add-function" | "add-option"

import { useState } from "react";
import { Btn, FormRow, FormField, FieldInput, FieldSelect, FieldTextarea } from "./UI";

// ── Individual form components ────────────────────────────────────────────────

function AddModuleForm({ onSave, onClose }) {
  const [d, setD] = useState({ name: "", singular: "", type: "Standard", icon: "box", description: "", owner: "", related: "None" });
  const set = (k) => (e) => setD(p => ({ ...p, [k]: e.target.value }));
  return (
    <>
      <FormRow>
        <FormField label="Module name"><FieldInput placeholder="e.g. Vendors" value={d.name} onChange={set("name")} /></FormField>
        <FormField label="Singular label"><FieldInput placeholder="e.g. Vendor" value={d.singular} onChange={set("singular")} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Module type"><FieldSelect options={["Standard","Custom","Extension"]} value={d.type} onChange={set("type")} /></FormField>
        <FormField label="Icon"><FieldSelect options={["box","users","user","coin","building","calendar","speakerphone","ticket","package"]} value={d.icon} onChange={set("icon")} /></FormField>
      </FormRow>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Description"><FieldTextarea placeholder="What does this module capture?" value={d.description} onChange={set("description")} /></FormField>
      </div>
      <FormRow>
        <FormField label="Owner"><FieldInput placeholder="Team or person" value={d.owner} onChange={set("owner")} /></FormField>
        <FormField label="Related module"><FieldSelect options={["None","Contacts","Deals","Accounts","Leads"]} value={d.related} onChange={set("related")} /></FormField>
      </FormRow>
      <FormActions onClose={onClose} onSave={() => onSave(d)} />
    </>
  );
}

function AddWorkflowForm({ onSave, onClose, selectedModule, modules }) {
  const moduleOptions = modules?.length ? modules.map(m => m.name) : ["Leads","Deals","Contacts","Accounts","Support Tickets","Campaigns","Activities"];
  const [d, setD] = useState({ name: "", module: selectedModule || moduleOptions[0], trigger: "Record Create", condition: "", description: "" });
  const set = (k) => (e) => setD(p => ({ ...p, [k]: e.target.value }));
  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Workflow name"><FieldInput placeholder="e.g. Deal Closed Won Notify" value={d.name} onChange={set("name")} /></FormField>
      </div>
      <FormRow>
        <FormField label="Module"><FieldSelect options={moduleOptions} value={d.module} onChange={set("module")} /></FormField>
        <FormField label="Trigger"><FieldSelect options={["Record Create","Record Edit","Field Change","Date-based","Scheduled"]} value={d.trigger} onChange={set("trigger")} /></FormField>
      </FormRow>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Trigger condition"><FieldInput placeholder="e.g. Deal Stage equals Closed Won" value={d.condition} onChange={set("condition")} /></FormField>
      </div>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Description / purpose"><FieldTextarea placeholder="What does this workflow do?" value={d.description} onChange={set("description")} /></FormField>
      </div>
      <FormActions onClose={onClose} onSave={() => onSave(d)}
        extraButton={<Btn onClick={() => { onClose(); window.sendPrompt?.("Help me build a new CRM workflow: " + d.name); }}>Build with AI ↗</Btn>}
      />
    </>
  );
}

function AddFieldForm({ onSave, onClose, selectedModule, modules }) {
  const moduleOptions = modules?.length ? modules.map(m => m.name) : ["Deals","Leads","Contacts","Accounts","Activities","Campaigns","Support Tickets"];
  const [d, setD] = useState({ name: "", apiName: "", module: selectedModule || moduleOptions[0], type: "Text", required: "No", visibility: "All roles", description: "" });
  const set = (k) => (e) => setD(p => ({ ...p, [k]: e.target.value }));
  const autoApiName = (e) => setD(p => ({ ...p, name: e.target.value, apiName: e.target.value.replace(/\s+/g, "_") }));
  return (
    <>
      <FormRow>
        <FormField label="Field label"><FieldInput placeholder="e.g. Contract Start Date" value={d.name} onChange={autoApiName} /></FormField>
        <FormField label="API name"><FieldInput placeholder="Auto-generated" value={d.apiName} onChange={set("apiName")} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Module"><FieldSelect options={moduleOptions} value={d.module} onChange={set("module")} /></FormField>
        <FormField label="Data type"><FieldSelect options={["Text","Integer","Currency","Date","DateTime","Picklist","Checkbox","Lookup","Formula","Textarea"]} value={d.type} onChange={set("type")} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Required?"><FieldSelect options={["No","Yes"]} value={d.required} onChange={set("required")} /></FormField>
        <FormField label="Visible to"><FieldSelect options={["All roles","Admin only","Manager+","SDR+"]} value={d.visibility} onChange={set("visibility")} /></FormField>
      </FormRow>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Description / purpose"><FieldTextarea placeholder="What data does this field capture?" value={d.description} onChange={set("description")} /></FormField>
      </div>
      <FormActions onClose={onClose} onSave={() => onSave(d)} />
    </>
  );
}

function AddFunctionForm({ onSave, onClose }) {
  const [d, setD] = useState({ name: "", module: "Deals", lang: "Deluge", description: "", params: "" });
  const set = (k) => (e) => setD(p => ({ ...p, [k]: e.target.value }));
  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Function name"><FieldInput placeholder="e.g. calcRenewalDate" value={d.name} onChange={set("name")} /></FormField>
      </div>
      <FormRow>
        <FormField label="Module"><FieldSelect options={["Deals","Leads","Contacts","Accounts","Activities","Campaigns","Support Tickets"]} value={d.module} onChange={set("module")} /></FormField>
        <FormField label="Language"><FieldSelect options={["Deluge","JavaScript","Python","REST API"]} value={d.lang} onChange={set("lang")} /></FormField>
      </FormRow>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Purpose / description"><FieldTextarea placeholder="What does this function do?" value={d.description} onChange={set("description")} /></FormField>
      </div>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Input parameters"><FieldInput placeholder="e.g. dealId, contractDate" value={d.params} onChange={set("params")} /></FormField>
      </div>
      <FormActions onClose={onClose} onSave={() => onSave(d)}
        extraButton={<Btn onClick={() => { onClose(); window.sendPrompt?.("Write a " + d.lang + " CRM function called " + d.name + ": " + d.description); }}>Generate code ↗</Btn>}
      />
    </>
  );
}

function AddOptionForm({ onSave, onClose }) {
  const [d, setD] = useState({ field: "Deal Stage", label: "", order: "", prob: "", status: "Active" });
  const set = (k) => (e) => setD(p => ({ ...p, [k]: e.target.value }));
  return (
    <>
      <FormRow>
        <FormField label="Field"><FieldSelect options={["Deal Stage","Lead Source","Lead Status","Contact Type"]} value={d.field} onChange={set("field")} /></FormField>
        <FormField label="Option label"><FieldInput placeholder="e.g. Pilot" value={d.label} onChange={set("label")} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Sort order"><FieldInput placeholder="e.g. 5" value={d.order} onChange={set("order")} /></FormField>
        <FormField label="Probability % (if stage)"><FieldInput placeholder="e.g. 75" value={d.prob} onChange={set("prob")} /></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Status"><FieldSelect options={["Active","Inactive"]} value={d.status} onChange={set("status")} /></FormField>
        <div />
      </FormRow>
      <FormActions onClose={onClose} onSave={() => onSave(d)} />
    </>
  );
}

// ── Shared form action row ────────────────────────────────────────────────────
function FormActions({ onClose, onSave, extraButton }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12, borderTop: "0.5px solid #e0ddd6", marginTop: 4 }}>
      <Btn onClick={onClose}>Cancel</Btn>
      {extraButton}
      <Btn primary onClick={onSave}>Save</Btn>
    </div>
  );
}

// ── Modal container ───────────────────────────────────────────────────────────
const FORM_MAP = {
  "add-module":   { title: "Add new module",      Form: AddModuleForm },
  "add-workflow": { title: "Add new workflow",    Form: AddWorkflowForm },
  "add-field":    { title: "Add new field",       Form: AddFieldForm },
  "add-function": { title: "Add new function",    Form: AddFunctionForm },
  "add-option":   { title: "Add picklist option", Form: AddOptionForm },
};

export default function Modal({ isOpen, type, onClose, onSave, selectedModule, modules }) {
  if (!isOpen || !type) return null;
  const { title, Form } = FORM_MAP[type] || {};
  if (!Form) return null;

  const handleSave = async (data) => {
    await onSave(data);
    onClose();
  };

  return (
    // Faux viewport — normal-flow, contributes layout height
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "0.5px solid #e0ddd6",
        padding: "1.25rem",
        width: 480,
        maxWidth: "95vw",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888" }}>
            <i className="ti ti-x" aria-label="Close" />
          </button>
        </div>
        <Form onSave={handleSave} onClose={onClose} selectedModule={selectedModule} modules={modules} />
      </div>
    </div>
  );
}
