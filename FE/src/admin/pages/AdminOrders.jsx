import { useState, useEffect, useCallback } from "react";
import { getAdminOrders, updateOrderStatus } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/helpers";
import {
  PageHeader, SearchBar, FilterSelect, StatusBadge,
  Pagination, DateRangePicker, useDebounce, Spinner,
} from "../components/ui/AdminUI";

const STATUS_OPTIONS = [
  { value: "all",        label: "All Statuses" },
  { value: "confirmed",  label: "Confirmed"    },
  { value: "processing", label: "Processing"   },
  { value: "shipped",    label: "Shipped"      },
  { value: "delivered",  label: "Delivered"    },
  { value: "cancelled",  label: "Cancelled"    },
];

const NEXT_STATUS = { confirmed: "processing", processing: "shipped", shipped: "delivered" };
const NEXT_LABEL  = { confirmed: "Mark Processing", processing: "Mark Shipped", shipped: "Mark Delivered" };

// 4-step progress indicator
function OrderProgress({ status }) {
  const steps = ["confirmed", "processing", "shipped", "delivered"];
  const idx   = steps.indexOf(status);
  if (idx === -1) return <StatusBadge status={status} />;
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-all ${i <= idx ? "bg-accent shadow-[0_0_6px_rgba(108,95,255,0.5)]" : "bg-border"}`} />
          {i < steps.length - 1 && <div className={`w-3 h-px ${i < idx ? "bg-accent" : "bg-border"}`} />}
        </div>
      ))}
      <span className="ml-2"><StatusBadge status={status} /></span>
    </div>
  );
}

// Inline detail panel
function OrderDetail({ order }) {
  return (
    <div className="bg-surface2 rounded-2xl p-5 mt-2 border border-border/50 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5">
        {[
          ["Order ID", `#${order.id}`],
          ["Customer", order.customerName],
          ["City", order.city],
          ["Payment", order.paymentMethod?.replace(/_/g, " ") ?? "—"],
        ].map(([l, v]) => (
          <div key={l} className="bg-surface rounded-xl p-3 border border-border/50">
            <p className="text-[10px] uppercase tracking-wide text-muted font-display font-bold mb-1">{l}</p>
            <p className="text-sm font-semibold capitalize">{v}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-[10px] uppercase tracking-wide text-muted font-display font-bold mb-3">Items</p>
        <div className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span className="text-text">{item.name} <span className="text-muted">× {item.quantity}</span></span>
              <span className="font-display font-bold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t border-border pt-3 mt-1">
            <span>Total</span>
            <span className="font-display tabular-nums text-accent">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const { success, error } = useToast();

  const [searchRaw,  setSearchRaw]  = useState("");
  const search = useDebounce(searchRaw, 350);

  const [status,     setStatus]     = useState("all");
  const [page,       setPage]       = useState(1);
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [sortKey,    setSortKey]    = useState("createdAt");
  const [sortDir,    setSortDir]    = useState("desc");
  const [orders,     setOrders]     = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(null);
  const [expanded,   setExpanded]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({ search, status, page, dateFrom, dateTo, sortKey, sortDir });
      setOrders(res.data); setTotal(res.total); setTotalPages(res.totalPages);
      setExpanded(null);
    } catch (e) { error("Load failed", e.message); }
    finally { setLoading(false); }
  }, [search, status, page, dateFrom, dateTo, sortKey, sortDir]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status, dateFrom, dateTo]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const handleAdvance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, next);
      success("Status updated", `Order #${order.id} → ${next}`);
      load();
    } catch (e) { error("Update failed", e.message); }
    finally { setUpdating(null); }
  };

  const exportCSV = () => {
    const headers = ["Order ID","Customer","Email","Date","Total","Status","Payment","City"];
    const rows    = orders.map((o) => [
      o.id, o.customerName, o.email,
      new Date(o.createdAt).toLocaleDateString(),
      o.total.toFixed(2), o.status, o.paymentMethod, o.city,
    ]);
    const csv  = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: `orders-${Date.now()}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  const cols = [
    { key: "id",           label: "Order ID",  width: "180px", sortable: true },
    { key: "customerName", label: "Customer" },
    { key: "createdAt",    label: "Date",      width: "130px", sortable: true },
    { key: "items",        label: "Items",     width: "70px"  },
    { key: "total",        label: "Total",     width: "120px", sortable: true },
    { key: "status",       label: "Status",    width: "220px" },
    { key: "_action",      label: "Action",    width: "175px" },
  ];

  const rowsWithDetail = orders.reduce((acc, row) => {
    acc.push(row);
    if (expanded === row.id) acc.push({ __detail: true, __order: row });
    return acc;
  }, []);

  const renderCell = (col, row) => {
    switch (col.key) {
      case "id": return (
        <button onClick={() => setExpanded(expanded === row.id ? null : row.id)}
          className="font-display text-xs font-bold text-accent hover:opacity-75 transition-opacity text-left inline-flex items-center gap-1.5 group">
          <span className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-[10px] group-hover:bg-accent/20 transition-colors">
            {expanded === row.id ? "▲" : "▼"}
          </span>
          #{row.id}
        </button>
      );
      case "customerName": return (
        <div>
          <p className="text-sm font-semibold">{row.customerName}</p>
          <p className="text-xs text-muted mt-0.5">{row.email}</p>
        </div>
      );
      case "createdAt": return (
        <span className="text-xs text-muted font-medium">
          {new Date(row.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
        </span>
      );
      case "items": return (
        <span className="flex justify-center">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface3 text-xs font-bold font-display border border-border">
            {row.items.length}
          </span>
        </span>
      );
      case "total": return (
        <span className="font-display font-bold text-sm tabular-nums">{formatPrice(row.total)}</span>
      );
      case "status": return <OrderProgress status={row.status} />;
      case "_action": {
        const next = NEXT_STATUS[row.status];
        return next
          ? (
            <button onClick={() => handleAdvance(row)} disabled={updating === row.id}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold font-display bg-surface border border-border rounded-xl text-text hover:border-accent hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-40 whitespace-nowrap shadow-sm">
              {updating === row.id ? <Spinner className="w-3 h-3" /> : null}
              {updating === row.id ? "Updating…" : NEXT_LABEL[row.status]}
            </button>
          )
          : <span className="text-xs text-muted">—</span>;
      }
      default: return row[col.key];
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${total} total orders`}
        actions={
          <button onClick={exportCSV}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-surface border border-border rounded-xl font-display font-bold text-sm hover:border-accent hover:text-accent transition-all shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        }
      />

      {/* Status summary chips */}
      {!loading && Object.keys(statusCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(statusCounts).map(([s, count]) => (
            <button key={s} onClick={() => setStatus(status === s ? "all" : s)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-display border transition-all ${
                status === s
                  ? "bg-accent/15 border-accent/30 text-[var(--color-accent-hl)] shadow-sm"
                  : "bg-surface border-border text-muted hover:border-border2 hover:text-text"
              }`}>
              <StatusBadge status={s} />
              <span className="text-muted font-medium">({count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder="Order ID, customer, email…" />
        <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <DateRangePicker from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} onClear={() => { setDateFrom(""); setDateTo(""); }} />
      </div>

      {/* Table */}
      <div className="card-base rounded-[18px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface3 border-b border-border">
                {cols.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-[0.1em] font-display whitespace-nowrap ${col.sortable ? "cursor-pointer hover:text-text transition-colors select-none" : ""}`}
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
                      {cols.map((_, j) => (
                        <td key={j} className="px-6 py-5">
                          <div className="skeleton h-3.5 rounded" style={{ width: `${55 + ((i*3+j*7)%35)}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : rowsWithDetail.length === 0
                ? (
                  <tr>
                    <td colSpan={cols.length} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface3 flex items-center justify-center text-xl opacity-50">📦</div>
                        <p className="text-sm text-muted">No orders found.</p>
                      </div>
                    </td>
                  </tr>
                )
                : rowsWithDetail.map((row) =>
                    row.__detail
                      ? (
                        <tr key={`d-${row.__order.id}`} className="bg-surface2/40">
                          <td colSpan={cols.length} className="px-6 py-3">
                            <OrderDetail order={row.__order} />
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
