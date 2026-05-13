/* ─────────────────────────────────────────────────────────
   SearchAtoms.jsx — Highlight, Spinner, Kbd
───────────────────────────────────────────────────────── */

/**
 * Highlight — wrap match trong <mark>
 * Dùng index parity (i % 2 === 1) thay vì regex.test()
 * để tránh side-effect của /g flag trên RegExp stateful
 */
export function Highlight({ text = "", query = "" }) {
  if (!query.trim() || !text) return <>{text}</>;
  const safe  = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safe})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? (
            <mark key={i} style={{
              background:   "rgba(124,111,247,0.22)",
              color:        "var(--color-accent-hl)",
              borderRadius: 3,
              padding:      "0 2px",
              fontWeight:   700,
            }}>
              {part}
            </mark>
          )
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <span
      aria-label="Đang tìm kiếm"
      style={{
        display:      "inline-block",
        width:        size,
        height:       size,
        border:       "2px solid rgba(124,111,247,0.2)",
        borderTop:    "2px solid var(--color-accent)",
        borderRadius: "50%",
        animation:    "tsNavSpin 0.6s linear infinite",
        flexShrink:   0,
      }}
    />
  );
}

export function Kbd({ children }) {
  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          2,
      border:       "1px solid var(--color-border)",
      background:   "var(--color-surface2)",
      borderRadius: 5,
      padding:      "1px 6px",
      fontSize:     10,
      color:        "var(--color-muted)",
      fontFamily:   "monospace",
      lineHeight:   1.8,
    }}>
      {children}
    </span>
  );
}
