/**
 * FilterSection.jsx — collapsible section wrapper
 */
import { useState } from "react";

export default function FilterSection({
  title,
  badge = 0,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      borderBottom:  "1px solid var(--color-border)",
      paddingBottom: open ? 18 : 0,
      marginBottom:  18,
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", background: "none",
          border: "none", cursor: "pointer", padding: "0 0 12px", gap: 6,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 10, textTransform: "uppercase",
            letterSpacing: "0.12em", color: "var(--color-muted)",
          }}>
            {title}
          </span>
          {badge > 0 && (
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 9, padding: "1px 6px", borderRadius: 99,
              background: "var(--color-accent)", color: "#fff", lineHeight: 1.6,
            }}>
              {badge}
            </span>
          )}
        </span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-muted)" strokeWidth="2.2" strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 180ms ease",
            flexShrink: 0,
          }}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && children}
    </div>
  );
}
