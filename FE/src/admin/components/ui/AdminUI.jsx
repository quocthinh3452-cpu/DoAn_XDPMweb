import { cn } from "../../../utils/cn";
import { useState, useEffect, useCallback, Component } from "react";

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────
export class AdminErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div className="flex flex-col items-center justify-center min-h-[380px] gap-5 text-center p-10">
        <div className="w-16 h-16 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center text-3xl shadow-lg">⚠️</div>
        <div>
          <p className="font-display font-bold text-lg mb-1.5">Something went wrong</p>
          <p className="text-sm text-muted max-w-xs leading-relaxed">{this.state.error.message}</p>
        </div>
        <button
          onClick={() => this.setState({ error: null })}
          className="px-6 py-2.5 bg-surface border border-border rounded-xl text-sm font-display font-bold hover:border-accent hover:text-accent transition-all shadow-sm"
        >
          Try again
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// STAT CARD — animated counter + sparkline
// ─────────────────────────────────────────────────────────────
export function StatCard({ label, value, unit, change, icon, color, trend = [] }) {
  const [displayed, setDisplayed] = useState(0);
  const isPos     = change > 0;
  const isNeutral = change === 0;

  useEffect(() => {
    const target = typeof value === "number" ? value : 0;
    let cur = 0;
    const inc = target / 40;
    const id = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setDisplayed(Math.floor(cur));
      if (cur >= target) clearInterval(id);
    }, 900 / 40);
    return () => clearInterval(id);
  }, [value]);

  return (
    <div className="card-base relative rounded-[22px] p-7 overflow-hidden group cursor-default hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={cn("text-xs font-bold font-display px-3 py-1.5 rounded-full border",
            isNeutral && "bg-surface3 text-muted border-border",
            isPos     && "bg-green/10 text-green border-green/20",
            !isPos && !isNeutral && "bg-red/10 text-red border-red/20")}>
            {isNeutral ? "—" : `${isPos ? "↑" : "↓"} ${Math.abs(change)}%`}
          </span>
        )}
      </div>

      <p className="font-display font-extrabold text-4xl tracking-tight text-text leading-none mb-2 tabular-nums">
        {unit === "$" && <span className="text-xl font-semibold text-muted mr-1">$</span>}
        {displayed.toLocaleString()}
      </p>
      <p className="text-sm text-muted font-medium">{label}</p>

      {trend.length > 1 && (
        <div className="mt-5 h-9"><SparkLine data={trend} color={color} /></div>
      )}

      <div className="absolute -bottom-10 -right-6 w-36 h-36 rounded-full blur-[50px] opacity-[0.10] pointer-events-none group-hover:opacity-[0.20] transition-opacity duration-300"
        style={{ background: color }} />
    </div>
  );
}

function SparkLine({ data, color }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const W = 100, H = 36;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`);
  const uid = color.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "c";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts.join(" ")} ${W},${H}`} fill={`url(#sg${uid})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-muted font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  confirmed:  { cls: "bg-blue-500/10 text-blue-300 border-blue-500/20",       label: "Confirmed",  pulse: false },
  processing: { cls: "bg-yellow/10 text-yellow border-yellow/20",             label: "Processing", pulse: true  },
  shipped:    { cls: "bg-purple-400/10 text-purple-300 border-purple-400/20", label: "Shipped",    pulse: true  },
  delivered:  { cls: "bg-green/10 text-green border-green/20",                label: "Delivered",  pulse: false },
  cancelled:  { cls: "bg-red/10 text-red border-red/20",                      label: "Cancelled",  pulse: false },
  active:     { cls: "bg-green/10 text-green border-green/20",                label: "Active",     pulse: false },
  inactive:   { cls: "bg-surface3 text-muted border-border",                  label: "Inactive",   pulse: false },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? { cls: "bg-border text-muted border-border2", label: status, pulse: false };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold font-display border",
      cfg.cls
    )}>
      {cfg.pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "currentColor" }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "currentColor" }} />
        </span>
      )}
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH BAR
// ─────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="relative flex-1 min-w-[220px] max-w-[380px]">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted shrink-0 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder:text-muted/50 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,111,247,0.12)] transition-all"
      />
      {value && (
        <button onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-surface3 text-muted text-xs hover:bg-border hover:text-text transition-all">
          ✕
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FILTER SELECT
// ─────────────────────────────────────────────────────────────
export function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-4 pr-9 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,111,247,0.12)] transition-all cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888a8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DATE RANGE PICKER
// ─────────────────────────────────────────────────────────────
export function DateRangePicker({ from, to, onFrom, onTo, onClear }) {
  const inputCls = "px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,111,247,0.12)] transition-all";
  const hasDates = from || to;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input type="date" value={from} onChange={(e) => onFrom(e.target.value)} className={inputCls} />
      <span className="text-muted text-sm font-medium">→</span>
      <input type="date" value={to} onChange={(e) => onTo(e.target.value)} className={inputCls} />
      {hasDates && (
        <button onClick={onClear}
          className="px-3 py-2.5 text-xs font-bold font-display text-muted hover:text-red border border-border rounded-xl hover:border-red/30 hover:bg-red/5 transition-all">
          Clear
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex w-10 h-5.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-40 disabled:cursor-not-allowed shrink-0",
        checked ? "bg-accent" : "bg-surface3 border border-border"
      )}
      style={{ height: "22px", width: "40px" }}
    >
      <span className={cn(
        "absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200",
        checked ? "translate-x-[19px]" : "translate-x-[3px]"
      )} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const btnBase = "min-w-[40px] h-10 px-3 flex items-center justify-center rounded-xl text-sm font-bold font-display border transition-all";
  const pages = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <p className="text-sm text-muted">
        Page <span className="font-bold text-text">{page}</span> of <span className="font-bold text-text">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className={cn(btnBase, "bg-surface border-border text-muted hover:border-border2 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed")}>
          ←
        </button>
        {pages.map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-muted text-sm">…</span>
            : <button key={p} onClick={() => onPage(p)}
                className={cn(btnBase, p === page
                  ? "bg-accent text-white border-accent shadow-[0_2px_10px_rgba(108,95,255,0.35)]"
                  : "bg-surface border-border text-muted hover:border-border2 hover:text-text")}>
                {p}
              </button>
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className={cn(btnBase, "bg-surface border-border text-muted hover:border-border2 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed")}>
          →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN TABLE — generic sortable table
// ─────────────────────────────────────────────────────────────
export function AdminTable({ columns, rows, loading, emptyMsg, onSort, sortKey, sortDir, renderCell }) {
  return (
    <div className="card-base rounded-[18px] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface3 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-[0.1em] font-display whitespace-nowrap",
                    col.sortable && "cursor-pointer hover:text-text transition-colors select-none"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="opacity-40 text-[10px]">
                        {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="skeleton h-3.5 rounded" style={{ width: `${55 + ((i * 3 + j * 7) % 35)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface3 flex items-center justify-center text-xl opacity-50">🔍</div>
                        <p className="text-sm text-muted">{emptyMsg}</p>
                      </div>
                    </td>
                  </tr>
                )
              : rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/40 last:border-b-0 hover:bg-surface3/50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 align-middle">
                        {renderCell(col, row)}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MINI BAR CHART
// ─────────────────────────────────────────────────────────────
export function MiniBarChart({ data, valueKey, labelKey, secondaryKey, color, secondaryColor }) {
  const [tooltip, setTooltip] = useState(null);
  const [activeKey, setActiveKey] = useState(valueKey);
  const max = Math.max(...data.map((d) => d[activeKey]), 1);
  const isLast = (i) => i === data.length - 1;
  const isMoney = activeKey === valueKey;

  return (
    <div>
      {secondaryKey && (
        <div className="flex gap-2 mb-4">
          {[{ k: valueKey, label: "Revenue", col: color }, { k: secondaryKey, label: "Orders", col: secondaryColor }].map(({ k, label, col }) => (
            <button key={k} onClick={() => setActiveKey(k)}
              className={cn("text-xs font-bold font-display px-3.5 py-1.5 rounded-full border transition-all",
                activeKey === k ? "text-white border-transparent shadow-sm" : "bg-surface border-border text-muted hover:text-text")}
              style={activeKey === k ? { background: col, borderColor: col } : {}}>
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 h-32 pb-6 relative">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative"
            onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
            {tooltip === i && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-display font-bold whitespace-nowrap z-10 shadow-xl pointer-events-none">
                <p className="text-muted text-[10px] mb-0.5">{d[labelKey]}</p>
                <p className="text-text">{isMoney ? "$" : ""}{d[activeKey].toLocaleString()}{!isMoney ? " orders" : ""}</p>
              </div>
            )}
            <div className="w-full min-h-[4px] rounded-t-lg transition-all duration-500"
              style={{
                height: `${(d[activeKey] / max) * 100}%`,
                background: isLast(i) ? `linear-gradient(to top, ${color}, ${color}aa)` : `${color}40`,
                boxShadow: isLast(i) ? `0 -2px 12px ${color}55` : "none",
                opacity: tooltip !== null && tooltip !== i ? 0.35 : 1,
              }} />
            <span className="absolute bottom-0 text-[10px] text-muted whitespace-nowrap font-display">{d[labelKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────
export function DonutChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((s, d) => s + d.percent, 0);
  const r = 38, circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-8 flex-wrap">
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="w-[120px] h-[120px] -rotate-90"
          style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.25))" }}>
          {data.map((d, i) => {
            const dash = (d.percent / total) * circ, gap = circ - dash;
            const offset = circ - acc * (circ / total);
            acc += d.percent;
            return (
              <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={d.color}
                strokeWidth={hovered === i ? 17 : 14}
                strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset}
                style={{ transition: "stroke-width 200ms, opacity 200ms", cursor: "pointer", opacity: hovered !== null && hovered !== i ? 0.25 : 1 }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            );
          })}
          <circle cx="50" cy="50" r="28" fill="var(--color-surface2)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center rotate-90 pointer-events-none">
          <div className="text-center">
            {hovered !== null ? (
              <>
                <p className="font-display font-extrabold text-sm text-text leading-none">{data[hovered].percent}%</p>
                <p className="text-[9px] text-muted mt-0.5 max-w-[56px] text-center leading-tight">{data[hovered].name}</p>
              </>
            ) : <p className="text-[9px] text-muted">Hover</p>}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3 text-sm cursor-default transition-all duration-150"
            style={{ opacity: hovered !== null && hovered !== i ? 0.3 : 1 }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color, boxShadow: `0 0 8px ${d.color}80` }} />
            <span className="flex-1 text-muted">{d.name}</span>
            <span className="font-bold font-display text-text">{d.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", confirmClass = "", onConfirm, onCancel, loading = false }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[600] flex items-center justify-center p-5"
      style={{ animation: "fadeIn 100ms ease" }} onClick={onCancel}>
      <div className="bg-surface border border-border rounded-2xl w-full max-w-[400px] p-7 shadow-[0_16px_64px_rgba(0,0,0,0.6)]"
        style={{ animation: "slideUp 180ms cubic-bezier(0.16,1,0.3,1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center text-2xl mb-5 shadow-sm">⚠️</div>
        <h3 className="font-display text-xl font-extrabold mb-2">{title}</h3>
        <p className="text-sm text-muted mb-7 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 bg-surface border border-border text-text rounded-xl font-display font-bold text-sm hover:border-border2 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={cn("flex-1 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2",
              confirmClass || "bg-red text-white hover:opacity-90 shadow-[0_2px_12px_rgba(239,68,68,0.3)]")}>
            {loading && <Spinner className="w-3.5 h-3.5" />}
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// METRIC ROW
// ─────────────────────────────────────────────────────────────
export function MetricRow({ items }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-7">
      {items.map(([label, val, sub, hl]) => (
        <div key={label} className="bg-surface border border-border rounded-2xl px-5 py-4 hover:border-border2 transition-colors">
          <p className={cn("font-display font-extrabold text-2xl mb-1 leading-none tabular-nums",
            hl === "warn" && "text-yellow", hl === "danger" && "text-red", hl === "success" && "text-green")}>
            {val}
          </p>
          <p className="text-xs font-bold text-muted uppercase tracking-wide">{label}</p>
          {sub && <p className="text-[10px] text-muted/50 mt-0.5">{sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ICONS + SPINNER
// ─────────────────────────────────────────────────────────────
export function SearchIcon({ className = "w-4 h-4 text-muted shrink-0" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function Spinner({ className = "w-4 h-4" }) {
  return <span className={cn("inline-block rounded-full border-2 border-current/20 border-t-current animate-spin", className)} />;
}
