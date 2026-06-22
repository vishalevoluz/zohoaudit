// ─── CRM Audit Studio · UI Primitives ────────────────────────────────────────
import { useState } from "react";

// ── Pill / Badge ──────────────────────────────────────────────────────────────
const PILL_STYLES = {
  green:   { bg: '#E1F5EE', color: '#085041' },
  amber:   { bg: '#FAEEDA', color: '#633806' },
  red:     { bg: '#FCEBEB', color: '#501313' },
  blue:    { bg: '#E6F1FB', color: '#0C447C' },
  gray:    { bg: '#F1EFE8', color: '#444441' },
  purple:  { bg: '#EEEDFE', color: '#3C3489' },
};

export function Pill({ variant = 'gray', children, style }) {
  const s = PILL_STYLES[variant] || PILL_STYLES.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 500,
      background: s.bg, color: s.color,
      ...style,
    }}>
      {children}
    </span>
  );
}

// ── Status pill helper ────────────────────────────────────────────────────────
export function StatusPill({ status }) {
  const map = {
    active: 'green', good: 'green', ok: 'green', applied: 'green', yes: 'green',
    review: 'amber', warning: 'amber', partial: 'amber', inactive: 'amber',
    issues: 'red',   error: 'red',    breaking: 'red',   no: 'red',   critical: 'red',
    draft: 'gray',   unused: 'gray',  none: 'gray',
    info: 'blue',    orphaned: 'red',
  };
  const label = { ok: 'OK', yes: 'Yes', no: 'No', partial: 'Partial' }[status] || status;
  return <Pill variant={map[status] || 'gray'}>{label.charAt(0).toUpperCase() + label.slice(1)}</Pill>;
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, primary, small, onClick, style }) {
  const [hov, setHov] = useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: small ? '4px 10px' : '6px 13px',
    fontSize: small ? 12 : 13,
    borderRadius: 8, cursor: 'pointer',
    border: '0.5px solid',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  };
  if (primary) return (
    <button
      style={{ ...base, background: hov ? '#0F6E56' : '#1D9E75', color: '#fff', borderColor: hov ? '#0F6E56' : '#1D9E75', ...style }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >{children}</button>
  );
  return (
    <button
      style={{ ...base, background: hov ? '#f0f0ed' : 'transparent', color: '#333', borderColor: '#ccc', ...style }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >{children}</button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e0ddd6',
      borderRadius: 12, padding: '1rem 1.25rem',
      marginBottom: '1rem', ...style,
    }}>
      {children}
    </div>
  );
}

export function CardTitle({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
      {icon && <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 16, color: '#888' }} />}
      {children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ value, label, delta, deltaType = 'up' }) {
  return (
    <div style={{ background: '#f5f4f0', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{label}</div>
      {delta && (
        <div style={{ fontSize: 11, marginTop: 4, color: deltaType === 'up' ? '#3B6D11' : '#854F0B' }}>{delta}</div>
      )}
    </div>
  );
}

// ── Progress Row ──────────────────────────────────────────────────────────────
const PROG_COLORS = { green: '#1D9E75', amber: '#EF9F27', red: '#E24B4A' };

export function ProgressRow({ label, value, color = 'green' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: '#666', minWidth: 140 }}>{label}</span>
      <div style={{ flex: 1, background: '#eee', borderRadius: 999, height: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, width: `${value}%`, background: PROG_COLORS[color] || PROG_COLORS.green, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, minWidth: 34, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

// ── Data Table ────────────────────────────────────────────────────────────────
export function Table({ columns, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} style={{
              textAlign: 'left', fontSize: 11, fontWeight: 500,
              color: '#999', textTransform: 'uppercase', letterSpacing: '0.6px',
              padding: '0 10px 8px', borderBottom: '0.5px solid #e0ddd6',
            }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f4f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '9px 10px', borderBottom: '0.5px solid #e0ddd6', verticalAlign: 'middle' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
export function SearchBar({ placeholder, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#f5f4f0', border: '0.5px solid #e0ddd6',
      borderRadius: 8, padding: '0 10px', marginBottom: '1rem',
    }}>
      <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 15, color: '#888' }} />
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ border: 'none', background: 'none', padding: '8px 0', fontSize: 13, flex: 1, outline: 'none' }}
      />
    </div>
  );
}

// ── Inner Tabs ────────────────────────────────────────────────────────────────
export function InnerTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: '1rem', borderBottom: '0.5px solid #e0ddd6' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '7px 14px', fontSize: 13, cursor: 'pointer',
            background: 'none', border: 'none', fontFamily: 'inherit',
            color: active === tab.id ? '#0F6E56' : '#888',
            borderBottom: active === tab.id ? '2px solid #1D9E75' : '2px solid transparent',
            fontWeight: active === tab.id ? 500 : 400,
            marginBottom: -1, transition: 'all 0.15s',
          }}
        >
          {tab.label}
          {tab.count != null && (
            <span style={{
              marginLeft: 5, fontSize: 10, fontWeight: 500,
              background: active === tab.id ? '#9FE1CB' : '#f0f0ed',
              color: active === tab.id ? '#085041' : '#888',
              padding: '1px 6px', borderRadius: 99,
            }}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Accordion Item ────────────────────────────────────────────────────────────
export function AccordionItem({ title, badge, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '0.5px solid #e0ddd6', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', cursor: 'pointer',
          background: open ? '#f5f4f0' : '#fff', transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{title}</span>
        {badge}
        <i className={`ti ti-chevron-down`} aria-hidden="true"
          style={{ fontSize: 14, color: '#888', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </div>
      {open && (
        <div style={{ padding: 12, background: '#f5f4f0', borderTop: '0.5px solid #e0ddd6', fontSize: 13, color: '#555' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Form field helpers ────────────────────────────────────────────────────────
export function FormRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>{children}</div>;
}

export function FormField({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

export function FieldInput({ placeholder, value, onChange }) {
  return (
    <input type="text" placeholder={placeholder} value={value || ''} onChange={onChange}
      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '0.5px solid #ccc', fontFamily: 'inherit' }} />
  );
}

export function FieldSelect({ options, value, onChange }) {
  return (
    <select value={value || ''} onChange={onChange}
      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '0.5px solid #ccc', fontFamily: 'inherit', background: '#fff' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function FieldTextarea({ placeholder, value, onChange }) {
  return (
    <textarea placeholder={placeholder} value={value || ''} onChange={onChange} rows={3}
      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '0.5px solid #ccc', fontFamily: 'inherit', resize: 'vertical' }} />
  );
}
