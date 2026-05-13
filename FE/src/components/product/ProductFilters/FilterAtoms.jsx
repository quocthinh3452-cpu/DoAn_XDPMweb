/**
 * FilterAtoms.jsx — primitive UI components
 * Toggle, RadioGroup, Chip, CategoryBtn, BrandCheckbox
 */

/* ── Toggle ─────────────────────────────────────────────── */
export function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, cursor: "pointer", userSelect: "none", padding: "6px 0",
    }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 13,
          color: checked ? "var(--color-text)" : "var(--color-text2)",
          transition: "color 150ms",
        }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-muted)" }}>
            {sublabel}
          </span>
        )}
      </span>
      <span style={{
        position: "relative", width: 34, height: 20, borderRadius: 99, flexShrink: 0,
        background: checked ? "var(--color-accent)" : "var(--color-surface3)",
        border: `1px solid ${checked ? "var(--color-accent)" : "var(--color-border2)"}`,
        transition: "background 180ms, border-color 180ms",
        display: "inline-block",
      }}>
        <input
          type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
          style={{ position: "absolute", opacity: 0, inset: 0, cursor: "pointer", margin: 0 }}
        />
        <span style={{
          position: "absolute", top: 2, left: checked ? 16 : 2,
          width: 14, height: 14, borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.28)",
          transition: "left 180ms cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "none",
        }} />
      </span>
    </label>
  );
}

/* ── RadioGroup ─────────────────────────────────────────── */
export function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(active ? null : opt.value)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 10px", borderRadius: 8, width: "100%",
              border: `1px solid ${active ? "rgba(124,111,247,0.28)" : "transparent"}`,
              background: active ? "rgba(124,111,247,0.10)" : "transparent",
              cursor: "pointer",
              transition: "background 150ms, border-color 150ms",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--color-surface)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{
              width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
              border: `1.5px solid ${active ? "var(--color-accent)" : "var(--color-border2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color 150ms",
            }}>
              {active && (
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-accent)" }} />
              )}
            </span>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: 13, flex: 1,
              color: active ? "var(--color-text)" : "var(--color-text2)",
              fontWeight: active ? 500 : 400,
              transition: "color 150ms",
            }}>
              {opt.label}
            </span>
            {opt.sublabel && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-muted)" }}>
                {opt.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Chip ── storage, RAM, color swatches ─────────────── */
export function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding:      color ? 0 : "4px 10px",
        width:        color ? 22 : "auto",
        height:       color ? 22 : "auto",
        borderRadius: color ? "50%" : 8,
        border:       active
          ? "2px solid var(--color-accent)"
          : `1.5px solid ${color ? "rgba(255,255,255,0.15)" : "var(--color-border)"}`,
        background:   color ?? (active ? "rgba(124,111,247,0.12)" : "var(--color-surface)"),
        boxShadow:    active && color ? "0 0 0 3px rgba(124,111,247,0.28)" : "none",
        color:        active ? "var(--color-accent)" : "var(--color-text2)",
        fontFamily:   "var(--font-body)", fontWeight: active ? 600 : 400, fontSize: 12,
        cursor:       "pointer",
        transform:    active && color ? "scale(1.12)" : "scale(1)",
        transition:   "border-color 150ms, background 150ms, box-shadow 150ms, color 150ms, transform 150ms",
      }}
    >
      {!color && label}
    </button>
  );
}

/* ── CategoryBtn ─────────────────────────────────────────── */
export function CategoryBtn({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, padding: "7px 10px", borderRadius: 8, width: "100%",
        border: `1px solid ${active ? "rgba(124,111,247,0.28)" : "transparent"}`,
        background: active ? "rgba(124,111,247,0.10)" : "transparent",
        color: active ? "var(--color-accent)" : "var(--color-text2)",
        fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
        transition: "background 150ms, border-color 150ms, color 150ms",
      }}
      onMouseEnter={e => {
        if (!active) { e.currentTarget.style.background = "var(--color-surface)"; e.currentTarget.style.color = "var(--color-text)"; }
      }}
      onMouseLeave={e => {
        if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text2)"; }
      }}
    >
      <span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 11,
          color: active ? "var(--color-accent)" : "var(--color-muted)",
          background: active ? "rgba(124,111,247,0.15)" : "var(--color-surface2)",
          padding: "1px 6px", borderRadius: 99, lineHeight: 1.6,
          transition: "background 150ms, color 150ms",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ── BrandCheckbox ──────────────────────────────────────── */
export function BrandCheckbox({ brand, checked, onToggle }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 10px", borderRadius: 8, cursor: "pointer", userSelect: "none",
      background: checked ? "rgba(124,111,247,0.08)" : "transparent",
      border: `1px solid ${checked ? "rgba(124,111,247,0.22)" : "transparent"}`,
      transition: "background 150ms, border-color 150ms",
    }}
      onMouseEnter={e => { if (!checked) e.currentTarget.style.background = "var(--color-surface)"; }}
      onMouseLeave={e => { if (!checked) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: 5, flexShrink: 0,
        border: `1.5px solid ${checked ? "var(--color-accent)" : "var(--color-border2)"}`,
        background: checked ? "var(--color-accent)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 150ms, border-color 150ms",
      }}>
        {checked && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <input
        type="checkbox" checked={checked} onChange={onToggle}
        style={{ display: "none" }} aria-label={brand.name}
      />
      <span style={{
        fontFamily: "var(--font-body)", fontSize: 13, flex: 1,
        color: checked ? "var(--color-text)" : "var(--color-text2)",
        transition: "color 150ms",
      }}>
        {brand.name}
      </span>
      {brand.count !== undefined && (
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-muted)",
          background: "var(--color-surface2)", padding: "1px 6px", borderRadius: 99, lineHeight: 1.6,
        }}>
          {brand.count}
        </span>
      )}
    </label>
  );
}
