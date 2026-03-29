/**
 * orderService.js
 *
 * Toggle mock/real: const USE_MOCK = true/false
 */

const USE_MOCK = true;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  { id: "cod",     label: "Thanh toán khi nhận hàng", icon: "💵" },
  { id: "vietqr",  label: "VietQR / Chuyển khoản",    icon: "🏦" },
  { id: "momo",    label: "MoMo",                      icon: "💜" },
  { id: "zalopay", label: "ZaloPay",                   icon: "🔵" },
];

// Các method cần hoàn tiền khi hủy
export const REQUIRES_PAYMENT = ["vietqr", "momo", "zalopay"];

export const ORDER_STATUSES = [
  { id: "all",            label: "Tất cả" },
  { id: "pending",        label: "Chờ xác nhận" },
  { id: "confirmed",      label: "Đã xác nhận" },
  { id: "shipping",       label: "Đang giao" },
  { id: "delivered",      label: "Đã giao" },
  { id: "cancelled",      label: "Đã hủy" },
  { id: "pending_refund", label: "Chờ hoàn tiền" },
  { id: "refunded",       label: "Đã hoàn tiền" },
];

// Đơn có thể hủy
export const CANCELLABLE_STATUSES = ["pending", "confirmed"];

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
  {
    id: "ORD-1001",
    status: "delivered",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    estimatedDelivery: new Date(Date.now() - 7 * 86400000).toISOString(),
    items: [
      { id: 1, name: "iPhone 15 Pro Max", variant: "256GB · Titan Đen", quantity: 1, price: 29990000, thumbnail: null },
      { id: 2, name: "Ốp lưng MagSafe",   variant: null,                quantity: 2, price: 590000,  thumbnail: null },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 35000,
    },
    payment: { method: "cod" },
    subtotal: 31170000, shippingFee: 35000, tax: 2493600,
    total: 33698600, coupon: null,
    cancelReason: null, cancelNote: null, refund: null,
  },
  {
    id: "ORD-1002",
    status: "shipping",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1 * 86400000).toISOString(),
    items: [
      { id: 3, name: "MacBook Pro 14\"", variant: "M3 Pro · 18GB", quantity: 1, price: 52990000, thumbnail: null },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "Gọi trước khi giao", shipperName: "GHN", fee: 0,
    },
    payment: { method: "vietqr" },
    subtotal: 52990000, shippingFee: 0, tax: 4239200,
    total: 57229200, coupon: null,
    cancelReason: null, cancelNote: null, refund: null,
  },
  {
    id: "ORD-1003",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
    items: [
      { id: 4, name: "AirPods Pro 2", variant: null, quantity: 1, price: 6490000, thumbnail: null },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 22000,
    },
    payment: { method: "momo" },
    subtotal: 6490000, shippingFee: 22000, tax: 519200,
    total: 7031200, coupon: { code: "SAVE10", discount: 649000 },
    cancelReason: null, cancelNote: null, refund: null,
  },
  {
    id: "ORD-1004",
    status: "pending_refund",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    estimatedDelivery: null,
    items: [
      { id: 5, name: "Apple Watch Ultra 2", variant: "49mm · Titanium", quantity: 1, price: 21990000, thumbnail: null },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 35000,
    },
    payment: { method: "zalopay" },
    subtotal: 21990000, shippingFee: 35000, tax: 1759200,
    total: 23784200, coupon: null,
    cancelReason: "found_cheaper",
    cancelNote: "Tìm thấy giá tốt hơn",
    refund: {
      amount: 23784200,
      method: "Hoàn về ví ZaloPay",
      estimatedDays: "1–3 ngày làm việc",
      requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  },
  {
    id: "ORD-1005",
    status: "confirmed",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
    items: [
      { id: 6, name: "iPad Pro 12.9\"",  variant: "256GB · WiFi", quantity: 1, price: 28990000, thumbnail: null },
      { id: 7, name: "Apple Pencil Pro", variant: null,            quantity: 1, price: 3490000,  thumbnail: null },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 0,
    },
    payment: { method: "zalopay" },
    subtotal: 32480000, shippingFee: 0, tax: 2598400,
    total: 35078400, coupon: null,
    cancelReason: null, cancelNote: null, refund: null,
  },
  {
    id: "ORD-1006",
    status: "refunded",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    estimatedDelivery: null,
    items: [
      { id: 8, name: "Magic Keyboard", variant: "Touch ID · Việt Nam", quantity: 1, price: 3290000, thumbnail: null },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 22000,
    },
    payment: { method: "momo" },
    subtotal: 3290000, shippingFee: 22000, tax: 263200,
    total: 3575200, coupon: null,
    cancelReason: "wrong_address",
    cancelNote: "",
    refund: {
      amount: 3575200,
      method: "Hoàn về ví MoMo",
      estimatedDays: "1–3 ngày làm việc",
      requestedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      completedAt:  new Date(Date.now() - 13 * 86400000).toISOString(),
    },
  },
];

// ─── Place order ──────────────────────────────────────────────────────────────

export async function placeOrder(payload) {
  if (USE_MOCK) {
    await delay(800);
    return {
      id: `ORD-${Date.now()}`,
      status: "confirmed",
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
    };
  }
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Lỗi ${res.status} khi đặt hàng`);
  }
  return res.json();
}

// ─── Get orders ───────────────────────────────────────────────────────────────

export async function getOrders() {
  if (USE_MOCK) {
    await delay(600);
    return [...MOCK_ORDERS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
  return res.json();
}

export async function getOrderById(orderId) {
  if (USE_MOCK) {
    await delay(400);
    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    return order;
  }
  const res = await fetch(`/api/orders/${orderId}`);
  if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
  return res.json();
}

// ─── Cancel order ─────────────────────────────────────────────────────────────

/**
 * @param {string} orderId
 * @param {{ reason: string, note: string }} cancelData
 */
export async function cancelOrder(orderId, { reason, note } = {}) {
  if (USE_MOCK) {
    await delay(800);
    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");

    const needsRefund = REQUIRES_PAYMENT.includes(order.payment.method);
    const newStatus   = needsRefund ? "pending_refund" : "cancelled";

    order.status       = newStatus;
    order.cancelReason = reason ?? null;
    order.cancelNote   = note   ?? null;

    if (needsRefund) {
      const refundDays = { vietqr: "3–5 ngày làm việc", momo: "1–3 ngày làm việc", zalopay: "1–3 ngày làm việc" };
      order.refund = {
        amount:        order.total,
        method:        "Hoàn về tài khoản/ví gốc",
        estimatedDays: refundDays[order.payment.method] ?? "3–5 ngày làm việc",
        requestedAt:   new Date().toISOString(),
        completedAt:   null,
      };
    }

    return { success: true, status: newStatus, refund: order.refund ?? null };
  }

  const res = await fetch(`/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason, note }),
  });
  if (!res.ok) throw new Error("Không thể hủy đơn hàng");
  return res.json(); // { success, status, refund }
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export async function getPaymentStatus(orderId) {
  if (USE_MOCK) { await delay(500); return { status: "pending" }; }
  const res = await fetch(`/api/orders/${orderId}/payment-status`);
  if (!res.ok) throw new Error("Không thể kiểm tra trạng thái thanh toán");
  return res.json();
}

export async function confirmPayment(orderId, token) {
  const res = await fetch(`/api/orders/${orderId}/confirm-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error("Xác nhận thanh toán thất bại");
  return res.json();
}
