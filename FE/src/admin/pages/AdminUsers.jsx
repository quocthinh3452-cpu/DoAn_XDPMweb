import { useState, useEffect, useCallback } from "react";
import { getAdminUsers } from "../services/adminService";
import { formatPrice } from "../../utils/helpers";
import { PageHeader, SearchBar, FilterSelect, AdminTable, StatusBadge, Pagination } from "../components/ui/AdminUI";

const STATUS_OPTIONS = [
  { value:"all",      label:"All Users"  },
  { value:"active",   label:"Active"     },
  { value:"inactive", label:"Inactive"   },
];

export default function AdminUsers() {
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState("all");
  const [page,       setPage]       = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAdminUsers({ search, status, page });
    setUsers(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status]);

  const totalSpent = users.reduce((s, u) => s + u.spent, 0);
  const avgOrders  = users.length ? (users.reduce((s, u) => s + u.orders, 0) / users.length).toFixed(1) : 0;
  const activeCount = users.filter(u => u.status === "active").length;

  const columns = [
    { key:"name", label:"User", render:(v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-full bg-accent text-white font-display font-bold text-base flex items-center justify-center shrink-0">{v.charAt(0).toUpperCase()}</div>
          <div><p className="text-sm font-medium">{v}</p><p className="text-xs text-muted">{row.email}</p></div>
        </div>
    )},
    { key:"joinedAt", label:"Joined", width:"130px", render:(v) => <span className="text-xs text-muted">{new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span> },
    { key:"orders",   label:"Orders", width:"90px",  render:(v) => <span className="font-display font-bold text-sm">{v}</span> },
    { key:"spent",    label:"Total Spent", width:"130px", render:(v) => <span className="font-display font-bold text-sm">{v > 0 ? formatPrice(v) : "—"}</span> },
    { key:"status",   label:"Status", width:"100px", render:(v) => <StatusBadge status={v} /> },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle={`${total} registered users`} />
      {/* Mini stats */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[
          ["Active (this page)", activeCount],
          ["Total Spent",        formatPrice(totalSpent)],
          ["Avg. Orders / User", avgOrders],
        ].map(([label, val]) => (
          <div key={label} className="bg-surface border border-border rounded-xl px-6 py-4 min-w-[160px]">
            <p className="font-display font-extrabold text-xl2 mb-1">{val}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name or email…" />
        <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>
      <AdminTable columns={columns} rows={users} loading={loading} emptyMsg="No users found." />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
