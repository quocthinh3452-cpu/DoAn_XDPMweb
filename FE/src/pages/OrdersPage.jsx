/**
 * OrdersPage.jsx
 * Route: /orders  và  /orders/:orderId (deep link)
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate }                    from "react-router-dom";
import {
  getOrders, getOrderById, cancelOrder, submitReview,
  ORDER_STATUSES, PAYMENT_METHODS, CANCELLABLE_STATUSES, CANCEL_REASONS,
} from "../services/orderService";
import { useCart }  from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/helpers";
import CancelOrderModal from "../components/checkout/CancelOrderModal";
import "./OrdersPage.css";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:        { label: "Chờ xác nhận",  color: "#f59e0b", bg: "#fef3c7" },
  confirmed:      { label: "Đã xác nhận",   color: "#3b82f6", bg: "#dbeafe" },
  shipping:       { label: "Đang giao",     color: "#8b5cf6", bg: "#ede9fe" },
  delivered:      { label: "Đã giao",       color: "#22c55e", bg: "#dcfce7" },
  cancelled:      { label: "Đã hủy",        color: "#ef4444", bg: "#fee2e2" },
  pending_refund: { label: "Chờ hoàn tiền", color: "#f97316", bg: "#ffedd5" },
  refunded:       { label: "Đã hoàn tiền",  color: "#14b8a6", bg: "#ccfbf1" },
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

function getCancelReasonLabel(id) {
  return CANCEL_REASONS.find((r) => r.id === id)?.label ?? id;
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

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="orders-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button"
          className={`orders-star ${(hovered || value) >= s ? "orders-star--on" : ""}`}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
        >★</button>
      ))}
    </div>
  );
}

// ─── ReviewForm ───────────────────────────────────────────────────────────────

function ReviewForm({ orderId, item, existing, onSubmit }) {
  const [rating,     setRating]     = useState(existing?.rating  ?? 0);
  const [comment,    setComment]    = useState(existing?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(!!existing);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try { await onSubmit(item.id, { rating, comment }); setDone(true); }
    finally { setSubmitting(false); }
  };

  if (done) return (
    <div className="orders-review-done">
      <StarRating value={rating} readonly />
      <p className="orders-review-done-comment">{comment || "Cảm ơn bạn đã đánh giá!"}</p>
    </div>
  );

  return (
    <div className="orders-review-form">
      <StarRating value={rating} onChange={setRating} />
      <textarea className="orders-review-textarea" rows={2} maxLength={300}
        placeholder="Chia sẻ cảm nhận của bạn…"
        value={comment} onChange={(e) => setComment(e.target.value)} />
      <button className="orders-review-submit" disabled={!rating || submitting} onClick={handleSubmit}>
        {submitting ? "Đang gửi…" : "Gửi đánh giá"}
      </button>
    </div>
  );
}

// ─── OrderTimeline ────────────────────────────────────────────────────────────

function OrderTimeline({ timeline }) {
  if (!timeline?.length) return null;
  return (
    <div className="orders-timeline">
      {timeline.map((step, i) => {
        const cfg    = STATUS_CONFIG[step.status] ?? {};
        const isLast = i === timeline.length - 1;
        return (
          <div key={i} className={`orders-tl-item ${isLast ? "orders-tl-item--active" : "orders-tl-item--done"}`}>
            <div className="orders-tl-line-wrap">
              <div className="orders-tl-dot" style={{ background: isLast ? cfg.color : "#22c55e" }} />
              {i < timeline.length - 1 && <div className="orders-tl-line" />}
            </div>
            <div className="orders-tl-content">
              <p className="orders-tl-label">{step.label}</p>
              <p className="orders-tl-time">{fmtDate(step.at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RefundInfo ───────────────────────────────────────────────────────────────

function RefundInfo({ refund, status }) {
  if (!refund) return null;
  return (
    <div className={`orders-refund-box ${status === "refunded" ? "orders-refund-box--done" : ""}`}>
      <span className="orders-refund-icon">{status === "refunded" ? "✅" : "⏳"}</span>
      <div className="orders-refund-content">
        <p className="orders-refund-title">{status === "refunded" ? "Đã hoàn tiền" : "Đang chờ hoàn tiền"}</p>
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

      <div className="orders-card-items-row">
        <div className="orders-card-thumbs">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="orders-card-thumb" style={{ zIndex: 10 - i, marginLeft: i ? "-10px" : 0 }}>
              {item.thumbnail
                ? <img src={item.thumbnail} alt={item.name} />
                : <span className="orders-card-thumb-placeholder">📦</span>}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="orders-card-thumb orders-card-thumb--more" style={{ marginLeft: "-10px" }}>
              +{order.items.length - 3}
            </div>
          )}
        </div>
        <div className="orders-card-item-text">
          <span className="orders-card-item-name">
            {firstItem.name}{firstItem.variant ? ` · ${firstItem.variant}` : ""}
          </span>
          {order.items.length > 1 && (
            <span className="orders-card-more">+{order.items.length - 1} sản phẩm khác</span>
          )}
        </div>
      </div>

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
        <button className="orders-cancel-btn"
          onClick={(e) => { e.stopPropagation(); onCancelClick(order); }}>
          Hủy đơn
        </button>
      )}
    </div>
  );
}

// ─── OrderDrawer ──────────────────────────────────────────────────────────────

function OrderDrawer({ order, onClose, onCancelClick, onReorder, onReview }) {
  const pm        = PAYMENT_METHODS.find((m) => m.id === order.payment.method);
  const canCancel  = CANCELLABLE_STATUSES.includes(order.status);
  const canReorder = ["delivered", "cancelled", "refunded"].includes(order.status);
  const canReview  = order.status === "delivered";

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const summaryRows = [
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
          {order.refund && (
            <div style={{ padding: "1rem 0 0" }}>
              <RefundInfo refund={order.refund} status={order.status} />
            </div>
          )}

          {order.cancelReason && (
            <section className="orders-drawer-section">
              <p className="orders-drawer-section-title">Lý do hủy</p>
              <p className="orders-drawer-row-bold">{getCancelReasonLabel(order.cancelReason)}</p>
              {order.cancelNote && <p className="orders-drawer-row-muted">"{order.cancelNote}"</p>}
            </section>
          )}

          {order.timeline?.length > 0 && (
            <section className="orders-drawer-section">
              <p className="orders-drawer-section-title">Lịch sử đơn hàng</p>
              <OrderTimeline timeline={order.timeline} />
            </section>
          )}

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Giao đến</p>
            <p className="orders-drawer-row-bold">{order.shipping.name} · {order.shipping.phone}</p>
            <p className="orders-drawer-row-muted">{fmtAddress(order.shipping)}</p>
            {order.shipping.note && <p className="orders-drawer-row-muted italic">Ghi chú: {order.shipping.note}</p>}
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Vận chuyển</p>
            <p className="orders-drawer-row-bold">{order.shipping.shipperName}</p>
            {order.estimatedDelivery && (
              <p className="orders-drawer-row-muted">Dự kiến: {fmtDateShort(order.estimatedDelivery)}</p>
            )}
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Thanh toán</p>
            <p className="orders-drawer-row-bold">{pm?.icon} {pm?.label ?? order.payment.method}</p>
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Sản phẩm ({order.items.length})</p>
            <div className="orders-drawer-items">
              {order.items.map((item, i) => {
                const existingReview = order.reviews?.find((r) => r.itemId === item.id);
                return (
                  <div key={i} className="orders-drawer-item-wrap">
                    <div className="orders-drawer-item">
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
                      <p className="orders-drawer-item-price">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    {canReview && (
                      <div className="orders-drawer-review">
                        <p className="orders-drawer-review-label">
                          {existingReview ? "Đánh giá của bạn" : "Đánh giá sản phẩm"}
                        </p>
                        <ReviewForm orderId={order.id} item={item} existing={existingReview}
                          onSubmit={(itemId, data) => onReview(order.id, itemId, data)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="orders-drawer-section">
            <p className="orders-drawer-section-title">Tổng tiền</p>
            <div className="orders-drawer-summary">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="orders-drawer-summary-row">
                  <span>{label}</span>
                  <span className={label.startsWith("Mã") ? "orders-drawer-discount" : ""}>{value}</span>
                </div>
              ))}
              <div className="orders-drawer-summary-total">
                <span>Tổng cộng</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>
        </div>

        {(canCancel || canReorder) && (
          <div className="orders-drawer-foot">
            {canReorder && (
              <button className="orders-drawer-reorder-btn" onClick={() => onReorder(order)}>
                🛒 Mua lại
              </button>
            )}
            {canCancel && (
              <button className="orders-drawer-cancel-btn" onClick={() => onCancelClick(order)}>
                Hủy đơn hàng
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyOrders({ hasFilter, onReset }) {
  return (
    <div className="orders-empty">
      <span className="orders-empty-icon">📋</span>
      <p className="orders-empty-title">{hasFilter ? "Không tìm thấy đơn hàng" : "Bạn chưa có đơn hàng nào"}</p>
      <p className="orders-empty-sub">{hasFilter ? "Thử thay đổi bộ lọc hoặc từ khóa" : "Hãy bắt đầu mua sắm!"}</p>
      {hasFilter && <button className="orders-reset-btn" onClick={onReset}>Xóa bộ lọc</button>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { orderId: deepLinkId } = useParams(); // /orders/:orderId
  const navigate                = useNavigate();
  const { addItem }             = useCart();
  const { success, error: toastError } = useToast();

  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState("all");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);

  // Load orders
  useEffect(() => {
    setLoading(true);
    getOrders()
      .then((data) => {
        setOrders(data);
        // Deep link — mở drawer ngay nếu có orderId trong URL
        if (deepLinkId) {
          const found = data.find((o) => o.id === deepLinkId);
          if (found) setSelected(found);
          else {
            // Thử fetch riêng nếu không có trong list (phân trang)
            getOrderById(deepLinkId)
              .then(setSelected)
              .catch(() => {});
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [deepLinkId]);

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

  const handleView        = useCallback((order) => {
    setSelected(order);
    // Cập nhật URL cho deep link nhưng không reload
    navigate(`/orders/${order.id}`, { replace: true });
  }, [navigate]);

  const handleCloseDrawer = useCallback(() => {
    setSelected(null);
    navigate("/orders", { replace: true });
  }, [navigate]);

  const handleCancelClick = useCallback((order) => setCancelTarget(order), []);
  const handleCloseModal  = useCallback(() => setCancelTarget(null), []);

  const handleConfirmCancel = useCallback(async ({ reason, note }) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const result = await cancelOrder(cancelTarget.id, { reason, note });
      const update = (o) => o.id === cancelTarget.id
        ? {
            ...o,
            status: result.status,
            cancelReason: reason,
            cancelNote: note,
            refund: result.refund ?? null,
            timeline: [...(o.timeline ?? []), {
              status: result.status,
              label: result.status === "pending_refund" ? "Yêu cầu hủy & hoàn tiền" : "Đã hủy",
              at: new Date().toISOString(),
            }],
          }
        : o;
      setOrders((prev) => prev.map(update));
      if (selected?.id === cancelTarget.id) setSelected((prev) => update(prev));
      setCancelTarget(null);
      success(
        result.status === "pending_refund"
          ? "Đã hủy đơn — đang xử lý hoàn tiền"
          : "Đã hủy đơn hàng"
      );
    } catch (err) {
      toastError("Không thể hủy đơn", err.message);
    } finally {
      setCancelling(false);
    }
  }, [cancelTarget, selected, success, toastError]);

  // Mua lại — dùng đúng CartContext.addItem signature
  const handleReorder = useCallback((order) => {
    order.items.forEach((item) => {
      addItem({
        productId: item.id,
        name:      item.name,
        price:     item.price,
        image:     item.thumbnail,
        quantity:  item.quantity,
        color:     undefined,
        storage:   undefined,
      });
    });
    handleCloseDrawer();
    success(`Đã thêm ${order.items.length} sản phẩm vào giỏ hàng`);
  }, [addItem, handleCloseDrawer, success]);

  const handleReview = useCallback(async (orderId, itemId, data) => {
    await submitReview(orderId, itemId, data);
    const addReview = (o) => {
      if (o.id !== orderId) return o;
      const reviews = [...(o.reviews ?? []).filter((r) => r.itemId !== itemId),
        { itemId, ...data, at: new Date().toISOString() }];
      return { ...o, reviews };
    };
    setOrders((prev) => prev.map(addReview));
    if (selected?.id === orderId) setSelected((prev) => addReview(prev));
    success("Đã gửi đánh giá!");
  }, [selected, success]);

  const hasFilter = activeTab !== "all" || search.trim() !== "";

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-page-head">
          <h1 className="orders-page-title">Đơn hàng của tôi</h1>
          {!loading && <span className="orders-page-count">{orders.length} đơn</span>}
        </div>

        <div className="orders-search-wrap">
          <span className="orders-search-icon">🔍</span>
          <input className="orders-search"
            placeholder="Tìm theo mã đơn hoặc tên sản phẩm…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="orders-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        <div className="orders-tabs">
          {ORDER_STATUSES.map((s) => (
            <button key={s.id}
              className={`orders-tab ${activeTab === s.id ? "orders-tab--active" : ""}`}
              onClick={() => setActiveTab(s.id)}>
              {s.label}
              {s.id !== "all" && (
                <span className="orders-tab-count">{orders.filter((o) => o.status === s.id).length}</span>
              )}
            </button>
          ))}
        </div>

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
              <OrderCard key={order.id} order={order}
                onView={handleView} onCancelClick={handleCancelClick} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <OrderDrawer order={selected}
          onClose={handleCloseDrawer}
          onCancelClick={handleCancelClick}
          onReorder={handleReorder}
          onReview={handleReview} />
      )}

      {cancelTarget && (
        <CancelOrderModal order={cancelTarget}
          onConfirm={handleConfirmCancel}
          onClose={handleCloseModal}
          loading={cancelling} />
      )}
    </div>
  );
}
