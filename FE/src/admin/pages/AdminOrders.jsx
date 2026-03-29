import { useState, useEffect, useCallback } from "react";
import { getAdminOrders, updateOrderStatus } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/helpers";
import { PageHeader, SearchBar, FilterSelect, AdminTable, StatusBadge, Pagination } from "../components/ui/AdminUI";

const STATUS_OPTIONS = [
  { value:"all",        label:"All Statuses"  },
  { value:"confirmed",  label:"Confirmed"     },
  { value:"processing", label:"Processing"    },
  { value:"shipped",    label:"Shipped"       },
  { value:"delivered",  label:"Delivered"     },
  { value:"cancelled",  label:"Cancelled"     },
];
const NEXT_STATUS = { confirmed:"processing", processing:"shipped", shipped:"delivered" };

export default function AdminOrders() {
  const { success, error } = useToast();
  const [orders, setOrders]       = useState([]);
  const [total,  setTotal]        = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);
  const [search,  setSearch]      = useState("");
  const [status,  setStatus]      = useState("all");
  const [page,    setPage]        = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAdminOrders({ search, status, page });
    setOrders(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status]);

  const handleAdvance = async (order) => {
    const next = NEXT_STATUS[order.status]; if (!next) return;
    setUpdating(order.id);
    try { await updateOrderStatus(order.id, next); success("Status updated", `Order → ${next}`); load(); }
    catch (err) { error("Update failed", err.message); }
    finally { setUpdating(null); }
  };

  const columns = [
    { key:"id",           label:"Order ID",  width:"180px", render:(v) => <span className="font-display text-xs font-bold text-accent">#{v}</span> },
    { key:"customerName", label:"Customer",  render:(v, row) => <div><p className="text-sm font-medium">{v}</p><p className="text-xs text-muted">{row.email}</p></div> },
    { key:"createdAt",    label:"Date",      width:"120px", render:(v) => <span className="text-xs text-muted">{new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span> },
    { key:"items",        label:"Items",     width:"70px",  render:(v) => <span className="block text-center font-bold">{v.length}</span> },
    { key:"total",        label:"Total",     width:"110px", render:(v) => <span className="font-display font-bold text-sm">{formatPrice(v)}</span> },
    { key:"status",       label:"Status",    width:"130px", render:(v) => <StatusBadge status={v} /> },
    { key:"_actions",     label:"Action",    width:"140px", render:(_, row) => {
        const next = NEXT_STATUS[row.status];
        return next
          ? <button onClick={() => handleAdvance(row)} disabled={updating === row.id}
              className="px-3 py-1.5 text-sm2 font-bold font-display bg-surface border border-border rounded-lg text-text hover:border-accent hover:text-accent transition-all disabled:opacity-40">
              {updating === row.id ? "…" : `→ ${next}`}
            </button>
          : <span className="text-xs text-muted">—</span>;
    }},
  ];

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${total} total orders`} />
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search order ID, customer…" />
        <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>
      <AdminTable columns={columns} rows={orders} loading={loading} emptyMsg="No orders found." />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
