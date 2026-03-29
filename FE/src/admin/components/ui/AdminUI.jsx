import { cn } from "../../../utils/cn";

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────
export function StatCard({ label, value, unit, change, icon, color }) {
  const isPos     = change > 0;
  const isNeutral = change === 0;

  return (
    <div className="card-base relative rounded-[18px] p-6 overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300">

      <div className="flex items-start justify-between mb-5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          {icon}
        </div>

        {/* Change badge */}
        {change !== undefined && (
          <span className={cn(
            "text-2xs font-bold font-display px-2.5 py-1 rounded-full",
            isNeutral && "bg-surface3 text-muted",
            isPos     && "bg-green/10 text-green border border-green/15",
            !isPos && !isNeutral && "bg-red/10 text-red border border-red/15"
          )}>
            {isNeutral ? "—" : `${isPos ? "↑" : "↓"} ${Math.abs(change)}%`}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="font-display font-extrabold text-3xl2 tracking-tight text-text leading-none mb-1.5">
        {unit === "$" && <span className="text-lg font-semibold text-muted mr-0.5">$</span>}
        {typeof value === "number" && unit === "$"
          ? value.toLocaleString("en-US", { maximumFractionDigits: 0 })
          : value.toLocaleString()}
      </p>

      <p className="text-sm text-muted">{label}</p>

      {/* Ambient glow */}
      <div
        className="absolute -bottom-8 -right-4 w-28 h-28 rounded-full blur-[32px] opacity-[0.12] pointer-events-none"
        style={{ background: color }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl2 font-extrabold tracking-tight mb-0.5">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  confirmed:  { cls: "bg-blue-500/10 text-blue-300 border-blue-500/20",      label: "Confirmed"  },
  processing: { cls: "bg-yellow/10 text-yellow border-yellow/20",            label: "Processing" },
  shipped:    { cls: "bg-purple-400/10 text-purple-300 border-purple-400/20",label: "Shipped"    },
  delivered:  { cls: "bg-green/10 text-green border-green/20",               label: "Delivered"  },
  cancelled:  { cls: "bg-red/10 text-red border-red/20",                     label: "Cancelled"  },
  active:     { cls: "bg-green/10 text-green border-green/20",               label: "Active"     },
  inactive:   { cls: "bg-red/10 text-red border-red/20",                     label: "Inactive"   },
};

const FALLBACK_STATUS = { cls: "bg-border text-muted border-border2", label: "" };

export function StatusBadge({ status }) {
  const { cls, label } = STATUS_CONFIG[status] ?? { ...FALLBACK_STATUS, label: status };
  return (
    <span className={cn("badge", cls)}>{label}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH BAR
// ─────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 px-3.5 py-2.5 min-w-[240px]",
      "bg-bg border-[1.5px] border-border rounded-[10px]",
      "transition-all duration-200",
      "focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(124,111,247,0.12)]"
    )}>
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-text text-sm placeholder:text-muted/50 min-w-0"
      />
      {value && (
        <button onClick={() => onChange("")} className="text-muted hover:text-text transition-colors text-base leading-none">
          ✕
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FILTER SELECT
// ─────────────────────────────────────────────────────────────
const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237878a0' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

export function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3.5 py-2.5 bg-bg border-[1.5px] border-border rounded-[10px] text-text text-sm outline-none focus:border-accent transition-colors cursor-pointer appearance-none pr-9"
      style={{ backgroundImage: CHEVRON_SVG, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN TABLE
// ─────────────────────────────────────────────────────────────
export function AdminTable({ columns, rows, loading, emptyMsg = "No data found." }) {
  return (
    <div className="card-base rounded-[16px] overflow-hidden">
      <table className="w-full border-collapse text-sm">

        <thead>
          <tr className="bg-surface3 border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-5 py-3.5 text-left text-2xs font-bold text-muted uppercase tracking-[0.1em] font-display whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <SkeletonRows count={5} cols={columns.length} />
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center text-sm text-muted">
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-border/40 last:border-b-0 hover:bg-surface3/50 transition-colors duration-150">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 align-middle">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
}

function SkeletonRows({ count, cols }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="border-b border-border/40">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-5 py-4">
          <div className="skeleton h-3 rounded" />
        </td>
      ))}
    </tr>
  ));
}

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 pt-5">
      <PageButton disabled={page === 1} onClick={() => onPage(page - 1)}>‹</PageButton>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PageButton key={p} active={p === page} onClick={() => onPage(p)}>{p}</PageButton>
      ))}
      <PageButton disabled={page === totalPages} onClick={() => onPage(page + 1)}>›</PageButton>
    </div>
  );
}

function PageButton({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border",
        "transition-all disabled:opacity-30 disabled:cursor-not-allowed",
        active
          ? "btn-primary"
          : "bg-surface2 border-border text-muted hover:border-border2 hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// MINI BAR CHART
// ─────────────────────────────────────────────────────────────
export function MiniBarChart({ data, valueKey, labelKey, color = "var(--color-accent)" }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  const isLast = (i) => i === data.length - 1;

  return (
    <div className="flex items-end gap-1.5 h-24 pb-6 relative">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div
            className="w-full min-h-[3px] rounded-t-md transition-all duration-700"
            title={`${d[labelKey]}: ${d[valueKey].toLocaleString()}`}
            style={{
              height:     `${(d[valueKey] / max) * 100}%`,
              background: isLast(i) ? `linear-gradient(to top, ${color}, ${color}99)` : `${color}55`,
              boxShadow:  isLast(i) ? `0 -2px 8px ${color}40` : "none",
            }}
          />
          <span className="absolute bottom-0 text-2xs text-muted whitespace-nowrap font-display">
            {d[labelKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────
export function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.percent, 0);
  const r = 40;
  const circ = 2 * Math.PI * r;
  let accumulated = 0;

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <svg viewBox="0 0 100 100" className="w-[110px] h-[110px] shrink-0 -rotate-90 drop-shadow-lg">
        {data.map((d, i) => {
          const dash   = (d.percent / total) * circ;
          const gap    = circ - dash;
          const offset = circ - accumulated * (circ / total);
          accumulated += d.percent;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none" stroke={d.color} strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 700ms ease" }}
            />
          );
        })}
        <circle cx="50" cy="50" r="33" fill="var(--color-surface2)" />
      </svg>

      <div className="flex flex-col gap-2.5 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}80` }} />
            <span className="flex-1 text-muted">{d.name}</span>
            <span className="font-bold font-display text-text">{d.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED ICONS
// ─────────────────────────────────────────────────────────────
export function SearchIcon({ className = "w-4 h-4 text-muted shrink-0" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
