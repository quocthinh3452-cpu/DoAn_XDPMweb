/**
 * SortDropdown.jsx — custom dropdown, dark-theme safe
 */
import { useState, useRef, useEffect } from "react";
import { SORT_OPTIONS } from "./FilterContext";

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref     = useRef(null);
  const current = SORT_OPTIONS.find(o => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const fn = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 8,
          padding: "9px 12px",
          background: "var(--color-surface)",
          border: `1px solid ${open ? "var(--color-accent)" : "var(--color-border)"}`,
          borderRadius: 10, color: "var(--color-text)",
          fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
          boxShadow: open ? "0 0 0 3px rgba(124,111,247,0.15)" : "none",
          transition: "border-color 150ms, box-shadow 150ms",
        }}
      >
        <span>{current.label}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-muted)" strokeWidth="2.2" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 180ms ease" }}
          aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          zIndex: 60, background: "var(--color-surface2)",
          border: "1px solid var(--color-border2)", borderRadius: 12,
          boxShadow: "var(--shadow-dropdown)", padding: 5, listStyle: "none",
          animation: "dropIn 140ms cubic-bezier(0.16,1,0.3,1)",
        }}>
          {SORT_OPTIONS.map(opt => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  role="option" aria-selected={active}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "8px 10px",
                    borderRadius: 8, border: "none",
                    background: active ? "rgba(124,111,247,0.10)" : "transparent",
                    color: active ? "var(--color-accent)" : "var(--color-text2)",
                    fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "background 120ms, color 120ms",
                  }}
                  onMouseEnter={e => {
                    if (!active) { e.currentTarget.style.background = "var(--color-surface3)"; e.currentTarget.style.color = "var(--color-text)"; }
                  }}
                  onMouseLeave={e => {
                    if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text2)"; }
                  }}
                >
                  {opt.label}
                  {active && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
