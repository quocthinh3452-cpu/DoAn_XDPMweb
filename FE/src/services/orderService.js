/**
 * orderService.js
 * Toggle: const USE_MOCK = true/false
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

export const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export const CANCEL_REASONS = [
  { id: "change_mind",     label: "Tôi muốn thay đổi sản phẩm/đơn hàng" },
  { id: "wrong_address",   label: "Tôi nhập sai địa chỉ giao hàng" },
  { id: "found_cheaper",   label: "Tôi tìm thấy giá rẻ hơn ở nơi khác" },
  { id: "wait_too_long",   label: "Thời gian giao hàng quá lâu" },
  { id: "duplicate_order", label: "Tôi đặt hàng bị trùng" },
  { id: "other",           label: "Lý do khác" },
];

// ─── Mock data — thumbnail dùng ảnh thật từ PRODUCTS ─────────────────────────

const MOCK_ORDERS = [
  {
    id: "ORD-1001",
    status: "delivered",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    estimatedDelivery: new Date(Date.now() - 7 * 86400000).toISOString(),
    items: [
      {
        id: 1, name: "iPhone 15 Pro Max", variant: "256GB · Titan Đen",
        quantity: 1, price: 29990000,
        thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
      },
      {
        id: 5, name: "AirPods Pro (2nd gen)", variant: null,
        quantity: 1, price: 5490000,
        thumbnail: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
      },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 35000,
    },
    payment: { method: "cod" },
    subtotal: 35480000, shippingFee: 35000, tax: 2838400,
    total: 38353400, coupon: null,
    cancelReason: null, cancelNote: null, refund: null,
    timeline: [
      { status: "pending",   label: "Đặt hàng",      at: new Date(Date.now() - 10 * 86400000).toISOString() },
      { status: "confirmed", label: "Xác nhận",       at: new Date(Date.now() - 10 * 86400000 + 3600000).toISOString() },
      { status: "shipping",  label: "Đang vận chuyển", at: new Date(Date.now() - 8 * 86400000).toISOString() },
      { status: "delivered", label: "Đã giao hàng",   at: new Date(Date.now() - 7 * 86400000).toISOString() },
    ],
    reviews: [],
  },
  {
    id: "ORD-1002",
    status: "shipping",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1 * 86400000).toISOString(),
    items: [
      {
        id: 4, name: 'MacBook Pro 14"', variant: "M3 Pro · 18GB",
        quantity: 1, price: 52990000,
        thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      },
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
    timeline: [
      { status: "pending",   label: "Đặt hàng",       at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { status: "confirmed", label: "Xác nhận",        at: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString() },
      { status: "shipping",  label: "Đang vận chuyển", at: new Date(Date.now() - 1 * 86400000).toISOString() },
    ],
    reviews: [],
  },
  {
    id: "ORD-1003",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
    items: [
      {
        id: 5, name: "AirPods Pro (2nd gen)", variant: null,
        quantity: 2, price: 5490000,
        thumbnail: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
      },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 22000,
    },
    payment: { method: "momo" },
    subtotal: 10980000, shippingFee: 22000, tax: 878400,
    total: 11880400, coupon: { code: "SAVE10", discount: 1098000 },
    cancelReason: null, cancelNote: null, refund: null,
    timeline: [
      { status: "pending", label: "Đặt hàng", at: new Date(Date.now() - 1 * 3600000).toISOString() },
    ],
    reviews: [],
  },
  {
    id: "ORD-1004",
    status: "pending_refund",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    estimatedDelivery: null,
    items: [
      {
        id: 6, name: "Samsung Galaxy Watch 6", variant: "44mm · Graphite",
        quantity: 1, price: 6990000,
        thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
      },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 35000,
    },
    payment: { method: "zalopay" },
    subtotal: 6990000, shippingFee: 35000, tax: 559200,
    total: 7584200, coupon: null,
    cancelReason: "found_cheaper",
    cancelNote: "Tìm thấy giá tốt hơn ở nơi khác",
    refund: {
      amount: 7584200,
      method: "Hoàn về ví ZaloPay",
      estimatedDays: "1–3 ngày làm việc",
      requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      completedAt: null,
    },
    timeline: [
      { status: "pending",        label: "Đặt hàng",       at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { status: "confirmed",      label: "Xác nhận",        at: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString() },
      { status: "pending_refund", label: "Yêu cầu hủy",    at: new Date(Date.now() - 4 * 86400000).toISOString() },
    ],
    reviews: [],
  },
  {
    id: "ORD-1005",
    status: "confirmed",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
    items: [
      {
        id: 7, name: 'iPad Pro 12.9"', variant: "256GB · WiFi",
        quantity: 1, price: 28990000,
        thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
      },
      {
        id: 8, name: "Sony WH-1000XM5", variant: "Black",
        quantity: 1, price: 8490000,
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 0,
    },
    payment: { method: "zalopay" },
    subtotal: 37480000, shippingFee: 0, tax: 2998400,
    total: 40478400, coupon: null,
    cancelReason: null, cancelNote: null, refund: null,
    timeline: [
      { status: "pending",   label: "Đặt hàng", at: new Date(Date.now() - 12 * 3600000).toISOString() },
      { status: "confirmed", label: "Xác nhận", at: new Date(Date.now() - 10 * 3600000).toISOString() },
    ],
    reviews: [],
  },
  {
    id: "ORD-1006",
    status: "refunded",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    estimatedDelivery: null,
    items: [
      {
        id: 8, name: "Sony WH-1000XM5", variant: "Platinum Silver",
        quantity: 1, price: 8490000,
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      },
    ],
    shipping: {
      name: "Nguyễn Văn A", phone: "0901234567",
      address: "123 Nguyễn Huệ", wardName: "Phường Bến Nghé",
      districtName: "Quận 1", provinceName: "TP. Hồ Chí Minh",
      note: "", shipperName: "GHN", fee: 22000,
    },
    payment: { method: "momo" },
    subtotal: 8490000, shippingFee: 22000, tax: 679200,
    total: 9191200, coupon: null,
    cancelReason: "wrong_address",
    cancelNote: "",
    refund: {
      amount: 9191200,
      method: "Hoàn về ví MoMo",
      estimatedDays: "1–3 ngày làm việc",
      requestedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      completedAt:  new Date(Date.now() - 13 * 86400000).toISOString(),
    },
    timeline: [
      { status: "pending",        label: "Đặt hàng",       at: new Date(Date.now() - 15 * 86400000).toISOString() },
      { status: "confirmed",      label: "Xác nhận",        at: new Date(Date.now() - 15 * 86400000 + 3600000).toISOString() },
      { status: "pending_refund", label: "Yêu cầu hủy",    at: new Date(Date.now() - 14 * 86400000).toISOString() },
      { status: "refunded",       label: "Đã hoàn tiền",   at: new Date(Date.now() - 13 * 86400000).toISOString() },
    ],
    reviews: [
      { itemId: 8, rating: 4, comment: "Âm thanh tốt nhưng giao sai màu.", at: new Date(Date.now() - 12 * 86400000).toISOString() },
    ],
  },
];

// ─── APIs ─────────────────────────────────────────────────────────────────────

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

export async function cancelOrder(orderId, { reason, note } = {}) {
  if (USE_MOCK) {
    await delay(800);
    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Không tìm thấy đơn hàng");
    const needsRefund = REQUIRES_PAYMENT.includes(order.payment.method);
    const newStatus   = needsRefund ? "pending_refund" : "cancelled";
    const refundDays  = { vietqr: "3–5 ngày làm việc", momo: "1–3 ngày làm việc", zalopay: "1–3 ngày làm việc" };
    order.status       = newStatus;
    order.cancelReason = reason ?? null;
    order.cancelNote   = note   ?? null;
    if (needsRefund) {
      order.refund = {
        amount: order.total, method: "Hoàn về tài khoản/ví gốc",
        estimatedDays: refundDays[order.payment.method] ?? "3–5 ngày làm việc",
        requestedAt: new Date().toISOString(), completedAt: null,
      };
    }
    order.timeline.push({
      status: newStatus,
      label: needsRefund ? "Yêu cầu hủy & hoàn tiền" : "Đã hủy",
      at: new Date().toISOString(),
    });
    return { success: true, status: newStatus, refund: order.refund ?? null };
  }
  const res = await fetch(`/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason, note }),
  });
  if (!res.ok) throw new Error("Không thể hủy đơn hàng");
  return res.json();
}

export async function submitReview(orderId, itemId, { rating, comment }) {
  if (USE_MOCK) {
    await delay(600);
    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (order) {
      order.reviews = order.reviews ?? [];
      order.reviews.push({ itemId, rating, comment, at: new Date().toISOString() });
    }
    return { success: true };
  }
  const res = await fetch(`/api/orders/${orderId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, rating, comment }),
  });
  if (!res.ok) throw new Error("Không thể gửi đánh giá");
  return res.json();
}

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
