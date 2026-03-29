/**
 * OrdersPage.jsx
 * Route: /orders
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOrders, cancelOrder,
  ORDER_STATUSES, PAYMENT_METHODS, CANCELLABLE_STATUSES, REQUIRES_PAYMENT,
} from "../services/orderService";
import { formatPrice } from "../utils/helpers";
import CancelOrderModal from "../components/checkout/CancelOrderModal";
import "./OrdersPage.css";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:        { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fef3c7" },
  confirmed:      { label: "Đã xác nhận",  color: "#3b82f6", bg: "#dbeafe" },
  shipping:       { label: "Đang giao",    color: "#8b5cf6", bg: "#ede9fe" },
  delivered:      { label: "Đã giao",      color: "#22c55e", bg: "#dcfce7" },
  cancelled:      { label: "Đã hủy",       color: "#ef4444", bg: "#fee2e2" },
  pending_refund: { label: "Chờ hoàn tiền", color: "#f97316", bg: "#ffedd5" },
  refunded:       { label: "Đã hoàn tiền", color: "#14b8a6", bg: "#ccfbf1" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric", month: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function fmtDateShort(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

function fmtAddress(s) {
  return [s.address, s.wardName, s.districtName, s.provinceName].filter(Boolean).join(", ");
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#666", bg: "#f0f0f0" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "99px",
      fontSize: "0.75rem", fontWeight: 600, color: cfg.color, background: cfg.bg,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── RefundInfo ───────────────────────────────────────────────────────────────

function RefundInfo({ refund, status }) {
  if (!refund) return null;
  return (
    <div className={`orders-refund-box ${status === "refunded" ? "orders-refund-box--done" : ""}`}>
      <span className="orders-refund-icon">{status === "refunded" ? "✅" : "⏳"}</span>
      <div className="orders-refund-content">
        <p className="orders-refund-title">
          {status === "refunded" ? "Đã hoàn tiền" : "Đang chờ hoàn tiền"}
        </p>
        <p className="orders-refund-amount">{formatPrice(refund.amount)}</p>
        <p className="orders-refund-meta">{refund.method} · {refund.estimatedDays}</p>
        {status === "refunded" && refund.completedAt && (
          <p className="orders-refund-meta">Hoàn thành: {fmtDateShort(refund.completedAt)}</p>
        )}
      </div>
    </div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order, onView, onCancelClick }) {
  const pm        = PAYMENT_METHODS.find((m) => m.id === order.payment.method);
  const firstItem = order.items[0];
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="orders-card" onClick={() => onView(order)}>
      <div className="orders-card-head">
        <div className="orders-card-meta">
          <span className="orders-card-id">#{order.id}</span>
          <span className="orders-card-date">{fmtDate(order.createdAt)}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="orders-card-items">
        <div className="orders-card-item-info">
          <span className="orders-card-item-name">
            {firstItem.name}{firstItem.variant ? ` · ${firstItem.variant}` : ""}
          </span>
          <span className="orders-card-item-qty">× {firstItem.quantity}</span>
        </div>
        {order.items.length > 1 && (
          <span className="orders-card-more">+{order.items.length - 1} sản phẩm khác</span>
        )}
      </div>

      {/* Refund badge trên card */}
      {(order.status === "pending_refund" || order.status === "refunded") && order.refund && (
        <div className="orders-card-refund-hint">
          {order.status === "refunded" ? "✅" : "⏳"}{" "}
          {order.status === "refunded" ? "Đã hoàn" : "Chờ hoàn"}{" "}
          <strong>{formatPrice(order.refund.amount)}</strong>
        </div>
      )}

      <div className="orders-card-foot">
        <div className="orders-card-payment">{pm?.icon} {pm?.label ?? order.payment.method}</div>
        <div className="orders-card-total">
          <span className="orders-card-total-label">Tổng</span>
          <span className="orders-card-total-amt">{formatPrice(order.total)}</span>
        </div>
      </div>

      {canCancel && (
        <button
          className="orders-cancel-btn"
          onClick={(e) => { e.stopPropagation(); onCancelClick(order); }}
        >
          Hủy đơn
        </button>
      )}
    </div>
  );
}

// ─── OrderDrawer ──────────────────────────────────────────────────────────────

function OrderDrawer({ order, onClose, onCancelClick }) {
  const pm      = PAYMENT_METHODS.find((m) => m.id === order.payment.method);
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const rows = [
    ["Tạm tính",   formatPrice(order.subtotal)],
    ["Vận chuyển", order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)],
    ["Thuế (8%)",  formatPrice(order.tax)],
    ...(order.coupon ? [[`Mã ${order.coupon.code}`, `−${formatPrice(order.coupon.discount)}`]] : []),
  ];

  return (
    <>
      <div className="orders-backdrop" onClick={onClose} />
      <div className="orders-drawer">
        <div className="orders-drawer-head">
          <div>
            <p className="orders-drawer-id">#{order.id}</p>
            <p className="orders-drawer-date">{fmtDate(order.createdAt)}</p>
          </div>
          <div className="orders-drawer-head-right">
            <StatusBadge status={order.status} />
            <button className="orders-drawer-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="orders-drawer-body">
          {/* Refund info */}
          {order.refund && (
            <div style={{ padding: "1rem 0 0" }}>
              <RefundInfo refund={order.refund} status={order.status} />
            </div>
          )}

          {/* Lý do hủy */}
          {order.cancelReason && (
            <section className="orders-drawer-section">
              <p className="orders-drawer-section-title">Lý do hủy</p>
              <p className="orders-drawer-row-bold">{order.cancelReason}</p>
              {order.cancelNote && (
                <p className="orders-drawer-row-muted">{order.cancelNote}</p>
              )}
            </section>
          )}

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Giao đến</p>
            <p className="orders-drawer-row-bold">{order.shipping.name} · {order.shipping.phone}</p>
            <p className="orders-drawer-row-muted">{fmtAddress(order.shipping)}</p>
            {order.shipping.note && (
              <p className="orders-drawer-row-muted italic">Ghi chú: {order.shipping.note}</p>
            )}
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Vận chuyển</p>
            <p className="orders-drawer-row-bold">{order.shipping.shipperName}</p>
            {order.estimatedDelivery && (
              <p className="orders-drawer-row-muted">
                Dự kiến: {fmtDateShort(order.estimatedDelivery)}
              </p>
            )}
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Thanh toán</p>
            <p className="orders-drawer-row-bold">{pm?.icon} {pm?.label ?? order.payment.method}</p>
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Sản phẩm ({order.items.length})</p>
            <div className="orders-drawer-items">
              {order.items.map((item, i) => (
                <div key={i} className="orders-drawer-item">
                  <div className="orders-drawer-item-thumb">
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt={item.name} />
                      : <span className="orders-drawer-item-placeholder">📦</span>}
                  </div>
                  <div className="orders-drawer-item-info">
                    <p className="orders-drawer-item-name">{item.name}</p>
                    {item.variant && <p className="orders-drawer-item-variant">{item.variant}</p>}
                    <p className="orders-drawer-item-qty">× {item.quantity}</p>
                  </div>
                  <p className="orders-drawer-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Tổng tiền</p>
            <div className="orders-drawer-summary">
              {rows.map(([label, value]) => (
                <div key={label} className="orders-drawer-summary-row">
                  <span>{label}</span>
                  <span className={label.startsWith("Mã") ? "orders-drawer-discount" : ""}>{value}</span>
                </div>
              ))}
              <div className="orders-drawer-summary-total">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>
        </div>

        {canCancel && (
          <div className="orders-drawer-foot">
            <button
              className="orders-drawer-cancel-btn"
              onClick={() => onCancelClick(order)}
            >
              Hủy đơn hàng
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyOrders({ hasFilter, onReset }) {
  return (
    <div className="orders-empty">
      <span className="orders-empty-icon">📋</span>
      <p className="orders-empty-title">
        {hasFilter ? "Không tìm thấy đơn hàng" : "Bạn chưa có đơn hàng nào"}
      </p>
      <p className="orders-empty-sub">
        {hasFilter ? "Thử thay đổi bộ lọc hoặc từ khóa" : "Hãy bắt đầu mua sắm!"}
      </p>
      {hasFilter && (
        <button className="orders-reset-btn" onClick={onReset}>Xóa bộ lọc</button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [activeTab,     setActiveTab]     = useState("all");
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState(null);  // drawer
  const [cancelTarget,  setCancelTarget]  = useState(null);  // modal
  const [cancelling,    setCancelling]    = useState(false);

  useEffect(() => {
    setLoading(true);
    getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (activeTab !== "all") list = list.filter((o) => o.status === activeTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, activeTab, search]);

  const handleView        = useCallback((order) => setSelected(order), []);
  const handleCloseDrawer = useCallback(() => setSelected(null), []);
  const handleCancelClick = useCallback((order) => setCancelTarget(order), []);
  const handleCloseModal  = useCallback(() => setCancelTarget(null), []);

  const handleConfirmCancel = useCallback(async ({ reason, note }) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const result = await cancelOrder(cancelTarget.id, { reason, note });

      // Cập nhật local state
      setOrders((prev) => prev.map((o) =>
        o.id === cancelTarget.id
          ? { ...o, status: result.status, cancelReason: reason, cancelNote: note, refund: result.refund }
          : o
      ));

      // Cập nhật drawer nếu đang mở đúng đơn đó
      if (selected?.id === cancelTarget.id) {
        setSelected((prev) => ({
          ...prev,
          status: result.status,
          cancelReason: reason,
          cancelNote: note,
          refund: result.refund,
        }));
      }

      setCancelTarget(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  }, [cancelTarget, selected]);

  const hasFilter = activeTab !== "all" || search.trim() !== "";

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-page-head">
          <h1 className="orders-page-title">Đơn hàng của tôi</h1>
          {!loading && <span className="orders-page-count">{orders.length} đơn</span>}
        </div>

        {/* Search */}
        <div className="orders-search-wrap">
          <span className="orders-search-icon">🔍</span>
          <input
            className="orders-search"
            placeholder="Tìm theo mã đơn hoặc tên sản phẩm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="orders-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Tabs */}
        <div className="orders-tabs">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.id}
              className={`orders-tab ${activeTab === s.id ? "orders-tab--active" : ""}`}
              onClick={() => setActiveTab(s.id)}
            >
              {s.label}
              {s.id !== "all" && (
                <span className="orders-tab-count">
                  {orders.filter((o) => o.status === s.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="orders-loading">
            {[1, 2, 3].map((i) => <div key={i} className="orders-skeleton" />)}
          </div>
        )}

        {error && (
          <div className="orders-error">
            <p>Không thể tải đơn hàng: {error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyOrders hasFilter={hasFilter} onReset={() => { setActiveTab("all"); setSearch(""); }} />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="orders-list">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={handleView}
                onCancelClick={handleCancelClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <OrderDrawer
          order={selected}
          onClose={handleCloseDrawer}
          onCancelClick={handleCancelClick}
        />
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          onConfirm={handleConfirmCancel}
          onClose={handleCloseModal}
          loading={cancelling}
        />
      )}
    </div>
  );
}
