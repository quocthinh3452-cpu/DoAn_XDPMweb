import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useOrder } from "../context/OrderContext";
import { useUser }  from "../context/UserContext";
import { PAYMENT_METHODS } from "../services/orderService";
import { formatPrice } from "../utils/helpers";
import Button from "../components/common/Button";

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(isoString) {
  if (!isoString) return null;
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day:     "numeric",
      month:   "long",
      year:    "numeric",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

function fmtAddress(shipping) {
  return [
    shipping.address,
    shipping.wardName,
    shipping.districtName,
    shipping.provinceName,
  ].filter(Boolean).join(", ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="px-6 py-5">
      <p className="text-xs font-bold uppercase tracking-[0.8px] text-muted font-display mb-2.5">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function OrderFailed({ message }) {
  return (
    <div className="container-page max-w-[520px] py-16 pb-20 text-center">
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5"
        style={{
          background: "rgba(239,68,68,0.9)",
          boxShadow:  "0 0 32px rgba(239,68,68,0.35)",
          animation:  "popIn 400ms cubic-bezier(0.175,0.885,0.32,1.275) forwards",
        }}
      >
        <XIcon />
      </div>
      <h1 className="font-display text-3xl font-extrabold mb-2">Đặt hàng thất bại</h1>
      <p className="text-muted text-sm mb-2">
        {message ?? "Có lỗi xảy ra khi xử lý đơn hàng của bạn."}
      </p>
      <p className="text-muted text-sm mb-8">
        Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục.
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Link to="/cart">
          <Button variant="primary" size="lg">Thử lại</Button>
        </Link>
        <Link to="/products">
          <Button variant="secondary" size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function OrderSuccess({ order }) {
  const { isLoggedIn } = useUser();
  const {
    id, items, shipping, payment,
    subtotal, shippingFee, tax, total,
    estimatedDelivery,
  } = order;

  const pm = PAYMENT_METHODS.find((m) => m.id === payment.method);

  const summaryRows = [
    ["Tạm tính",   formatPrice(subtotal)],
    ["Vận chuyển", shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)],
    ["Thuế (8%)",  formatPrice(tax)],
  ];

  return (
    <div className="container-page max-w-[680px] py-12 pb-20">
      {/* ── Hero ── */}
      <div className="text-center mb-9">
        <div
          className="w-[72px] h-[72px] rounded-full bg-green flex items-center justify-center mx-auto mb-5"
          style={{
            boxShadow: "0 0 32px rgba(34,197,94,0.35)",
            animation: "popIn 400ms cubic-bezier(0.175,0.885,0.32,1.275) forwards",
          }}
        >
          <CheckIcon />
        </div>
        <h1 className="font-display text-3xl font-extrabold mb-2">Đặt hàng thành công!</h1>
        <p className="text-muted text-sm mb-5">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ chuẩn bị và giao hàng sớm nhất.
        </p>
        <span className="inline-block bg-surface2 border border-border rounded-full px-5 py-1.5 font-display text-sm font-bold text-accent">
          Mã đơn #{id}
        </span>
        {estimatedDelivery && (
          <p className="text-muted text-sm mt-3">
            📦 Dự kiến giao:{" "}
            <strong className="text-text">{fmtDate(estimatedDelivery)}</strong>
          </p>
        )}
      </div>

      {/* ── Detail card ── */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-7 divide-y divide-border">

        <Section title="Giao đến">
          <p className="font-semibold text-sm">{shipping.name}</p>
          <p className="text-sm text-muted">{shipping.phone}</p>
          <p className="text-sm text-muted">{fmtAddress(shipping)}</p>
          {shipping.note && (
            <p className="text-sm text-muted italic mt-1">Ghi chú: {shipping.note}</p>
          )}
        </Section>

        <Section title="Đơn vị vận chuyển">
          <p className="text-sm font-semibold">{shipping.shipperName}</p>
          {shipping.eta && (
            <p className="text-xs text-muted mt-0.5">Dự kiến: {fmtDate(shipping.eta)}</p>
          )}
        </Section>

        <Section title="Phương thức thanh toán">
          <p className="text-sm">{pm?.icon} {pm?.label ?? payment.method}</p>
          <p className="text-xs text-muted mt-1">
            {payment.method === "cod"
              ? "Thanh toán khi nhận hàng."
              : payment.method === "vietqr"
                ? "Đơn hàng xác nhận sau khi nhận được tiền chuyển khoản."
                : "Bạn sẽ được chuyển sang app ví để hoàn tất."}
          </p>
        </Section>

        <Section title={`Sản phẩm (${items.length})`}>
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <img
                  src={item.thumbnail ?? item.image}
                  alt={item.name}
                  className="w-[52px] h-[52px] object-cover rounded-lg border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.variant ? `${item.variant} · ` : ""}× {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-sm shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tổng tiền">
          <div className="flex flex-col gap-2 text-sm text-muted">
            {summaryRows.map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span>{label}</span>
                <span className={
                  shippingFee === 0 && label === "Vận chuyển"
                    ? "text-green font-semibold"
                    : ""
                }>
                  {value}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-display text-lg font-extrabold text-text pt-3 border-t border-border mt-1">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {isLoggedIn
          ? <Link to="/orders"><Button variant="secondary" size="lg">Xem đơn hàng của tôi</Button></Link>
          : <Link to="/auth"><Button variant="secondary" size="lg">Tạo tài khoản để theo dõi đơn</Button></Link>
        }
        <Link to="/products">
          <Button variant="primary" size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderSuccessPage() {
  const { currentOrder } = useOrder();
  const navigate         = useNavigate();
  const location         = useLocation();

  const errorMessage = location.state?.error ?? null;

  useEffect(() => {
    if (!errorMessage && !currentOrder) navigate("/products");
  }, [errorMessage, currentOrder, navigate]);

  if (errorMessage) return <OrderFailed message={errorMessage} />;
  if (!currentOrder) return null;

  return <OrderSuccess order={currentOrder} />;
}