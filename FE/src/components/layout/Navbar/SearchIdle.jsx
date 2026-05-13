/* ─────────────────────────────────────────────────────────
   SearchIdle.jsx — màn hình mặc định khi chưa gõ gì:
   lịch sử tìm kiếm + từ khoá phổ biến
───────────────────────────────────────────────────────── */
import { clearHistory } from "./searchUtils";

function HistoryIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

const sectionLabel = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
  textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--color-muted)",
};

export function SearchIdle({ history, popularSearches, onPickQuery, onClearHistory }) {
  return (
    <div style={{ padding: 14 }}>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={sectionLabel}>Gần đây</span>
            <button
              onClick={() => { clearHistory(); onClearHistory(); }}
              style={{
                fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-muted)",
                background: "none", border: "none", cursor: "pointer", padding: 0,
                transition: "color 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--color-muted)"; }}
            >
              Xoá tất cả
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {history.map(q => (
              <button
                key={q}
                onClick={() => onPickQuery(q)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 8px", borderRadius: 8,
                  border: "none", background: "transparent",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "background 100ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <HistoryIcon />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text2)" }}>{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular */}
      <div>
        <p style={{ ...sectionLabel, marginBottom: 8 }}>Tìm nhiều nhất</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {popularSearches.map(h => (
            <button
              key={h}
              onClick={() => onPickQuery(h)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 11px", borderRadius: 9,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface2)",
                cursor: "pointer", textAlign: "left",
                transition: "border-color 130ms, background 130ms",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.background  = "rgba(124,111,247,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.background  = "var(--color-surface2)";
              }}
            >
              <SearchIcon />
              <span style={{
                fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text2)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {h}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
