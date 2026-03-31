import { useState, useEffect, useCallback } from "react";
import { getAdminUsers, toggleUserStatus } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/helpers";
import { PageHeader, SearchBar, FilterSelect, Pagination, MetricRow, StatusBadge, Toggle, useDebounce, Spinner } from "../components/ui/AdminUI";

const STATUS_OPTIONS = [
  { value: "all",      label: "All Users"  },
  { value: "active",   label: "Active"     },
  { value: "inactive", label: "Inactive"   },
];

const SORT_OPTIONS = [
  { value: "spent",    label: "Highest LTV"    },
  { value: "orders",   label: "Most Orders"    },
  { value: "joinedAt", label: "Recently Joined"},
  { value: "name",     label: "Name (A–Z)"     },
];

// Color-coded avatar
const AVATAR_COLORS = ["#6c63ff","#22c55e","#f59e0b","#ec4899","#3b82f6","#8b5cf6","#14b8a6","#f97316"];
function UserAvatar({ name, size = 10 }) {
  const col = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const px  = size * 4;
  return (
    <div className="rounded-full font-display font-bold text-white flex items-center justify-center shrink-0 ring-2 ring-border"
      style={{
        background: `linear-gradient(135deg, ${col}, ${col}bb)`,
        boxShadow: `0 2px 10px ${col}40`,
        width: px, height: px, fontSize: px * 0.38,
        minWidth: px,
      }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// LTV tier badge
function LTVBadge({ spent }) {
  if (spent >= 5000) return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow/10 text-yellow border border-yellow/20">🏆 VIP</span>
  );
  if (spent >= 2000) return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20">⭐ Pro</span>
  );
  if (spent >= 500) return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/20">Regular</span>
  );
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface3 text-muted border border-border">New</span>
  );
}

// Mini order bar
function OrderBar({ orders, max }) {
  const pct = max > 0 ? Math.min((orders / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 bg-surface3 rounded-full overflow-hidden max-w-[64px]">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-display font-bold text-sm tabular-nums w-5 text-right">{orders}</span>
    </div>
  );
}

// Expanded user detail
function UserDetail({ user }) {
  return (
    <div className="bg-surface2 rounded-2xl p-5 mt-2 border border-border/50 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ["Email",       user.email],
          ["Joined",      new Date(user.joinedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})],
          ["Orders",      user.orders],
          ["Total Spent", user.spent > 0 ? formatPrice(user.spent) : "—"],
        ].map(([l, v]) => (
          <div key={l} className="bg-surface rounded-xl p-3 border border-border/50">
            <p className="text-[10px] uppercase tracking-wide text-muted font-display font-bold mb-1">{l}</p>
            <p className="text-sm font-semibold">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { success, error } = useToast();

  const [searchRaw,  setSearchRaw]  = useState("");
  const search = useDebounce(searchRaw, 350);

  const [status,     setStatus]     = useState("all");
  const [sortVal,    setSortVal]    = useState("spent");
  const [page,       setPage]       = useState(1);
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState(null);
  const [expanded,   setExpanded]   = useState(null);

  const sortKey = sortVal === "name" ? "name" : sortVal;
  const sortDir = sortVal === "name" || sortVal === "joinedAt" ? "asc" : "desc";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ search, status, page, sortKey, sortDir });
      setUsers(res.data); setTotal(res.total); setTotalPages(res.totalPages);
      setExpanded(null);
    } catch (e) { error("Load failed", e.message); }
    finally { setLoading(false); }
  }, [search, status, page, sortKey, sortDir]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status, sortVal]);

  const handleToggle = async (user) => {
    setToggling(user.id);
    try {
      const res = await toggleUserStatus(user.id);
      success("Status changed", `${user.name} is now ${res.data.status}`);
      load();
    } catch (e) { error("Failed", e.message); }
    finally { setToggling(null); }
  };

  const totalSpent  = users.reduce((s, u) => s + u.spent, 0);
  const activeCount = users.filter((u) => u.status === "active").length;
  const vipCount    = users.filter((u) => u.spent >= 5000).length;
  const avgLTV      = users.length ? Math.round(totalSpent / users.length) : 0;
  const maxOrders   = Math.max(...users.map((u) => u.orders), 1);

  const rowsWithDetail = users.reduce((acc, row) => {
    acc.push(row);
    if (expanded === row.id) acc.push({ __detail: true, __user: row });
    return acc;
  }, []);

  const cols = [
    { key:"name",     label:"User",   w:"auto"  },
    { key:"joinedAt", label:"Joined", w:"140px" },
    { key:"orders",   label:"Orders", w:"145px" },
    { key:"spent",    label:"LTV",    w:"200px" },
    { key:"status",   label:"Status", w:"180px" },
  ];

  const renderCell = (col, row) => {
    switch (col.key) {
      case "name": return (
        <button onClick={() => setExpanded(expanded === row.id ? null : row.id)}
          className="flex items-center gap-3.5 text-left w-full group">
          <UserAvatar name={row.name} size={10} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold group-hover:text-accent transition-colors">{row.name}</p>
            <p className="text-xs text-muted truncate mt-0.5">{row.email}</p>
          </div>
          <span className={`text-muted/30 text-[10px] transition-opacity shrink-0 w-5 h-5 flex items-center justify-center rounded-lg border border-border/0 group-hover:border-border bg-surface3/0 group-hover:bg-surface3 transition-all`}>
            {expanded === row.id ? "▲" : "▼"}
          </span>
        </button>
      );
      case "joinedAt": return (
        <span className="text-xs text-muted font-medium">
          {new Date(row.joinedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
        </span>
      );
      case "orders": return <OrderBar orders={row.orders} max={maxOrders} />;
      case "spent": return (
        <div className="flex items-center gap-2.5">
          <span className="font-display font-bold text-sm tabular-nums">{row.spent > 0 ? formatPrice(row.spent) : "—"}</span>
          <LTVBadge spent={row.spent} />
        </div>
      );
      case "status": return (
        <div className="flex items-center gap-3">
          <Toggle
            checked={row.status === "active"}
            onChange={() => handleToggle(row)}
            disabled={toggling === row.id}
          />
          {toggling === row.id
            ? <Spinner className="w-3.5 h-3.5" />
            : <StatusBadge status={row.status} />
          }
        </div>
      );
      default: return row[col.key];
    }
  };

  return (
    <div>
      <PageHeader title="Users" subtitle={`${total} registered users`} />

      {!loading && (
        <MetricRow items={[
          ["Active",  activeCount,                   `of ${users.length} this page`],
          ["Revenue", formatPrice(totalSpent),        "from this page"],
          ["Avg LTV", `$${avgLTV.toLocaleString()}`,  "per customer"],
          ["VIP",     vipCount,                       "spent $5k+", vipCount > 0 ? "success" : null],
        ]} />
      )}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder="Name or email…" />
        <FilterSelect value={status}  onChange={setStatus}  options={STATUS_OPTIONS} />
        <FilterSelect value={sortVal} onChange={setSortVal} options={SORT_OPTIONS} />
      </div>

      {/* Table */}
      <div className="card-base rounded-[18px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface3 border-b border-border">
                {cols.map((col) => (
                  <th key={col.key} style={{ width: col.w }}
                    className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-[0.1em] font-display whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      {cols.map((_, j) => (
                        <td key={j} className="px-6 py-5">
                          <div className="skeleton h-3.5 rounded" style={{ width:`${55+((i*3+j*7)%35)}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : rowsWithDetail.length === 0
                ? (
                  <tr>
                    <td colSpan={cols.length} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface3 flex items-center justify-center text-xl opacity-50">👥</div>
                        <p className="text-sm text-muted">No users found.</p>
                      </div>
                    </td>
                  </tr>
                )
                : rowsWithDetail.map((row) =>
                    row.__detail
                      ? (
                        <tr key={`d-${row.__user.id}`} className="bg-surface2/40">
                          <td colSpan={cols.length} className="px-6 py-3">
                            <UserDetail user={row.__user} />
                          </td>
                        </tr>
                      )
                      : (
                        <tr key={row.id}
                          className={`border-b border-border/40 last:border-b-0 transition-colors ${
                            expanded === row.id ? "bg-surface3/40" : "hover:bg-surface3/50"
                          }`}>
                          {cols.map((col) => (
                            <td key={col.key} className="px-6 py-4 align-middle">
                              {renderCell(col, row)}
                            </td>
                          ))}
                        </tr>
                      )
                  )
              }
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={(p) => { setPage(p); setExpanded(null); }} />
    </div>
  );
}
