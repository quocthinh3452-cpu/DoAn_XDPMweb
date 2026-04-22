import { useState, useEffect, useCallback } from "react";
import { getAdminOrders, updateOrderStatus } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/helpers";
import {
  PageHeader, SearchBar, FilterSelect, StatusBadge,
  Pagination, DateRangePicker, useDebounce, Spinner,
} from "../components/ui/AdminUI";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const NEXT_STATUS = { confirmed: "processing", processing: "shipped", shipped: "delivered" };
const NEXT_LABEL = { confirmed: "Mark Processing", processing: "Mark Shipped", shipped: "Mark Delivered" };

// 4-step progress indicator
function OrderProgress({ status }) {
  const steps = ["confirmed", "processing", "shipped", "delivered"];
  const idx = steps.indexOf(status);
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

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 350);
  const [updatingStatus, setUpdatingStatus] = useState(false); // Thêm state loading cho nút bấm
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({ search, status, page, dateFrom, dateTo, sortKey, sortDir });
      setOrders(res.data || res || []);
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
  //hàm xử lý chi tiết
  const handleViewDetails = async (orderId) => {
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      // THAY CHỮ 'token' BẰNG ĐÚNG TÊN KEY BẠN TÌM THẤY Ở BƯỚC 1 (vd: 'access_token')
      const token = localStorage.getItem('techstore_token');

      console.log("Token đang dùng là:", token); // In ra để kiểm tra thử

      if (!token) {
        alert("Không tìm thấy token đăng nhập! Vui lòng đăng nhập lại.");
        setLoadingDetails(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Đọc lỗi chi tiết từ Laravel gửi về (nếu có)
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi mạng: ${response.status}`);
      }

      const result = await response.json();
      setSelectedOrderDetails(result);
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      alert(error.message); // Báo lỗi lên màn hình để dễ sửa
    } finally {
      setLoadingDetails(false);
    }
  };
  //hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    // Xác nhận trước khi đổi trạng thái (đặc biệt khi Hủy)
    if (!window.confirm(`Bạn có chắc muốn đổi trạng thái đơn hàng thành: ${newStatus}?`)) return;

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('techstore_token');
      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }) // Gửi trạng thái mới lên server
      });

      if (!response.ok) throw new Error("Cập nhật thất bại!");

      alert("✅ Đã cập nhật trạng thái thành công!");
      setIsModalOpen(false); // Đóng modal

      // MẸO: Chỗ này bạn có thể gọi lại hàm lấy danh sách đơn hàng (ví dụ: fetchOrders()) 
      // để bảng bên ngoài tự động cập nhật màu sắc status mới nhé.
      window.location.reload(); // Tạm thời reload trang để thấy kết quả ngay

    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };
  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Date", "Total", "Status", "Payment", "City"];
    const rows = orders.map((o) => [
      o.id, o.customerName, o.email,
      new Date(o.createdAt).toLocaleDateString(),
      o.total.toFixed(2), o.status, o.paymentMethod, o.city,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `orders-${Date.now()}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  const statusCounts = (orders || []).reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const cols = [
    { key: "id", label: "Order ID", width: "100px" },
    { key: "customerName", label: "Customer" },
    { key: "date", label: "Date" },
    { key: "itemCount", label: "Items", width: "80px" },
    { key: "total", label: "Total", width: "150px" },
    { key: "status", label: "Status", width: "120px" },
    { key: "actions", label: "Action", width: "100px" },
  ];

  const rowsWithDetail = (orders || []).reduce((acc, row) => {
    acc.push(row);
    if (expanded === row.id) acc.push({ __detail: true, __order: row });
    return acc;
  }, []);

  const renderCell = (col, row) => {
    switch (col.key) {
      case "id":
        return <span className="font-bold text-accent">#{row.id}</span>;
      case "customerName":
        // Nếu không có customerName, thử lấy customer_email, nếu vẫn không có thì để "Khách vãng lai"
        return <span className="font-medium">{row.customerName || row.customer_email || "Khách vãng lai"}</span>;
      case "date":
        return <span className="text-muted">{new Date(row.date || row.created_at).toLocaleDateString()}</span>;
      case "itemCount":
        // Hiển thị số lượng món hàng
        return <span className="font-display font-bold text-text">{row.itemCount || 0}</span>;
      case "total":
        return <span className="font-display font-extrabold">{formatPrice(row.total)}</span>;
      case "status":
        return <StatusBadge status={row.status} />;
      case "actions":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleViewDetails(row.id)} // GẮN SỰ KIỆN VÀO ĐÂY
              className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
              title="Xem chi tiết"
            >
              👁️
            </button>
          </div>
        );
      default:
        return row[col.key];
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders?.total || orders?.data?.length || 0} total orders`}
        actions={
          <button onClick={exportCSV}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-surface border border-border rounded-xl font-display font-bold text-sm hover:border-accent hover:text-accent transition-all shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-display border transition-all ${status === s
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
                        <div className="skeleton h-3.5 rounded" style={{ width: `${55 + ((i * 3 + j * 7) % 35)}%` }} />
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
                          className={`border-b border-border/40 last:border-b-0 transition-colors ${expanded === row.id ? "bg-surface3/40" : "hover:bg-surface3/50"
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
      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}>

          <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}> {/* Chặn click xuyên thấu */}

            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface2">
              <h3 className="font-display font-extrabold text-lg text-text">
                Chi tiết đơn hàng {selectedOrderDetails && `#${selectedOrderDetails.order.id}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-red transition-colors text-xl">
                ✕
              </button>
            </div>

            {/* Body Modal (Chứa danh sách sản phẩm) */}
            <div className="p-6 overflow-y-auto">
              {loadingDetails ? (
                <div className="flex justify-center py-10"><span className="animate-spin text-accent text-3xl">↻</span></div>
              ) : selectedOrderDetails ? (
                <div className="flex flex-col gap-4">

                  {/* Vòng lặp in ra từng món hàng */}
                  {selectedOrderDetails.items.map((item, index) => {
                    // Chỉ cần lấy đúng tên biến `image_url` từ JSON
                    const imageUrl = item.image_url || 'https://placehold.co/150x150/f8fafc/a4b1cd?text=No+Image';

                    return (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-surface3 border border-border/50">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover bg-surface"
                          onError={(e) => { e.target.src = 'https://placehold.co/150x150/f8fafc/a4b1cd?text=Loi+Anh'; }}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-text line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted mt-1">{formatPrice(item.price)} x {item.quantity}</p>
                        </div>
                        <div className="font-display font-bold text-accent">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    );
                  })}

                </div>
              ) : (
                <p className="text-center text-muted">Không tải được dữ liệu.</p>
              )}
            </div>

            {/* Footer Modal (Đã thêm nút Cập nhật) */}
            {selectedOrderDetails && !loadingDetails && (
              <div className="px-6 py-4 border-t border-border bg-surface2 flex flex-col gap-4">

                {/* Phần hiển thị Tổng tiền */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted uppercase tracking-wide">Tổng cộng</span>
                  <span className="font-display font-extrabold text-2xl text-text">
                    {formatPrice(selectedOrderDetails.order.total_amount)}
                  </span>
                </div>

                {/* Phần nút Hành động (Chỉ hiện nếu đơn hàng chưa bị hủy) */}
                {selectedOrderDetails.order.status !== 'cancelled' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <button
                      onClick={() => handleUpdateStatus(selectedOrderDetails.order.id, 'cancelled')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-red/10 text-red hover:bg-red/20 rounded-lg font-bold text-sm transition-colors"
                    >
                      Hủy đơn
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedOrderDetails.order.id, 'shipped')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-accent/10 text-accent hover:bg-accent/20 rounded-lg font-bold text-sm transition-colors"
                    >
                      Giao hàng
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedOrderDetails.order.id, 'completed')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg font-bold text-sm transition-colors"
                    >
                      Hoàn thành
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
