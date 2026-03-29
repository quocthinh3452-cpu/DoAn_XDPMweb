/* ─────────────────────────────────────────────────────────
   SearchResults.jsx — v2
   FIX #3  Result items fade opacity dần (top = full, bottom = mờ)
   FIX #4  listRef forwarded từ SearchOverlay (cho scroll-into-view)
───────────────────────────────────────────────────────── */
import { Highlight, Spinner } from "./SearchAtoms";
import { fmt } from "./searchUtils";

/* ── opacity theo vị trí — top item sắc nét, bottom mờ dần ── */
function itemOpacity(index, total) {
  if (total <= 3) return 1;
  const fade = [1, 0.88, 0.72, 0.55, 0.40, 0.30, 0.22];
  return fade[index] ?? 0.22;
}

/* Stock badge */
function StockBadge({ stock }) {
  if (stock === 0) return <span style={{ color: "var(--color-red,#f87171)",    fontWeight: 700 }}>· Hết hàng</span>;
  if (stock <= 5)  return <span style={{ color: "var(--color-yellow,#fbbf24)", fontWeight: 700 }}>· Còn {stock}</span>;
  return                  <span style={{ color: "var(--color-green,#4ade80)",  fontWeight: 700 }}>· Còn hàng</span>;
}

/* Single result row */
function ResultItem({ product: p, query, isSelected, onSelect, onHover, opacity }) {
  const discount = p.originalPrice && p.price < p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;

  return (
    <button
      role="option"
      aria-selected={isSelected}
      onMouseEnter={onHover}
      onClick={onSelect}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          12,
        width:        "100%",
        padding:      "10px 12px",
        borderRadius: 12,
        border:       "none",
        background:   isSelected ? "var(--color-surface2)" : "transparent",
        textAlign:    "left",
        cursor:       "pointer",
        /* FIX #3: fade opacity — hover luôn full opacity */
        opacity:      isSelected ? 1 : opacity,
        transition:   "background 100ms, opacity 150ms",
      }}
      /* hover: luôn full opacity khi mouse vào */
      onFocus={e  => { e.currentTarget.style.opacity = "1"; }}
      onBlur={e   => { e.currentTarget.style.opacity = isSelected ? "1" : String(opacity); }}
    >
      <img
        src={p.image}
        alt={p.name}
        loading="lazy"
        style={{
          width: 48, height: 48,
          objectFit: "cover",
          borderRadius: 10,
          border: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
          color: "var(--color-text)", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
          lineHeight: 1.35, marginBottom: 3,
        }}>
          <Highlight text={p.name} query={query} />
        </p>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-muted)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Highlight text={p.brand} query={query} />
          <StockBadge stock={p.stock} />
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
          background: "linear-gradient(135deg, var(--color-accent-hl), #c084fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {fmt(p.price)}
        </span>
        {discount > 0 && (
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9,
            padding: "1px 5px", borderRadius: 99,
            background: "rgba(240,98,146,0.15)", color: "var(--color-accent2-hl)",
            border: "1px solid rgba(240,98,146,0.22)",
          }}>
            -{discount}%
          </span>
        )}
      </div>
    </button>
  );
}

/* Loading skeleton */
function LoadingSkeleton() {
  return (
    <div style={{ padding: "8px 8px" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 12,
          opacity: itemOpacity(i - 1, 3),
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, flexShrink: 0,
            background: "var(--color-surface2)",
            animation: "tsSkeleton 1.2s ease-in-out infinite",
          }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{
              height: 13, borderRadius: 6, width: "60%",
              background: "var(--color-surface2)",
              animation: "tsSkeleton 1.2s ease-in-out infinite",
            }} />
            <div style={{
              height: 11, borderRadius: 6, width: "35%",
              background: "var(--color-surface2)",
              animation: "tsSkeleton 1.2s ease-in-out infinite",
              animationDelay: `${i * 80}ms`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Empty state */
export function EmptyState({ query, popularSearches, onPickQuery }) {
  return (
    <div style={{ padding: "28px 20px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)", marginBottom: 6 }}>
          Không tìm thấy kết quả cho
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>
          "{query}"
        </p>
      </div>
      <p style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
        textTransform: "uppercase", letterSpacing: "0.10em",
        color: "var(--color-muted)", marginBottom: 8, textAlign: "center",
      }}>
        Thử tìm kiếm
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {popularSearches.map(h => (
          <button
            key={h}
            onClick={() => onPickQuery(h)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 99,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface2)",
              cursor: "pointer",
              fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text2)",
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
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main export ── */
/* FIX #4: nhận listRef từ SearchOverlay thay vì tự tạo */
export function SearchResults({ results, query, selectedIdx, onSelect, onHover, onViewAll, loading, isFirstLoad, listRef }) {
  const hasResults = results.length > 0;

  if (isFirstLoad && loading && !hasResults) return <LoadingSkeleton />;
  if (!hasResults) return null;

  return (
    <>
      {/* Section label */}
      <div style={{ padding: "12px 20px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
          textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--color-muted)",
        }}>
          Kết quả ({results.length})
        </span>
        {loading && <Spinner size={12} />}
      </div>

      {/* List — FIX #4: dùng listRef được forward từ Overlay */}
      <div
        id="search-result-list"
        ref={listRef}
        role="listbox"
        aria-label="Kết quả tìm kiếm"
        style={{ padding: "0 8px" }}
      >
        {results.map((p, i) => (
          <ResultItem
            key={p.id}
            product={p}
            query={query}
            isSelected={i === selectedIdx}
            onSelect={() => onSelect(p.id)}
            onHover={() => onHover(i)}
            /* FIX #3: truyền opacity theo vị trí */
            opacity={itemOpacity(i, results.length)}
          />
        ))}
      </div>

      {/* Xem tất cả */}
      <button
        onClick={onViewAll}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "12px 20px",
          border: "none", borderTop: "1px solid var(--color-border)",
          background: "transparent", cursor: "pointer",
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
          color: "var(--color-accent)", transition: "background 120ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface2)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <span>Xem tất cả kết quả cho "{query}"</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </>
  );
}
