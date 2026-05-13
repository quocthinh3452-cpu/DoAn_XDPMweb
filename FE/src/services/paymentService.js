/**
 * paymentService.js
 *
 * VietQR  — generate URL từ thông tin ngân hàng (free, không cần API key)
 * MoMo    — mock tạm, khi Laravel xong gọi POST /api/payment/momo/create
 * ZaloPay — mock tạm, khi Laravel xong gọi POST /api/payment/zalopay/create
 *
 * ── Cấu hình VietQR ─────────────────────────────────────────────────────────
 * Thêm vào .env:
 *   VITE_BANK_ID=VCB          (mã ngân hàng: VCB, TCB, MB, ACB, ...)
 *   VITE_BANK_ACCOUNT=123456789
 *   VITE_BANK_NAME=NGUYEN+VAN+A   (tên chủ TK, dấu + thay dấu cách)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BANK_ID      = import.meta.env.VITE_BANK_ID      ?? "VCB";
const BANK_ACCOUNT = import.meta.env.VITE_BANK_ACCOUNT ?? "1234567890";
const BANK_NAME    = import.meta.env.VITE_BANK_NAME    ?? "NGUYEN+VAN+A";

// ─── VietQR ──────────────────────────────────────────────────────────────────

/**
 * Tạo URL ảnh QR VietQR
 * Docs: https://vietqr.io/danh-sach-api/tao-ma-qr
 *
 * @param {{ orderId: string, amount: number, description?: string }}
 * @returns string  (URL ảnh PNG)
 */
export function buildVietQRUrl({ orderId, amount, description }) {
  const desc = encodeURIComponent(description ?? `Thanh toan don hang ${orderId}`);
  return [
    `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-qr_only.png`,
    `?amount=${Math.round(amount)}`,
    `&addInfo=${desc}`,
    `&accountName=${BANK_NAME}`,
  ].join("");
}

/**
 * Thông tin ngân hàng để hiện dưới QR
 */
export function getBankInfo() {
  return {
    bankId:      BANK_ID,
    account:     BANK_ACCOUNT,
    accountName: decodeURIComponent(BANK_NAME.replace(/\+/g, " ")),
  };
}

// ─── MoMo ────────────────────────────────────────────────────────────────────

/**
 * Tạo đơn thanh toán MoMo
 *
 * MOCK: Trả về QR giả.
 * Khi Laravel xong, backend POST tới:
 *   https://test-payment.momo.vn/v2/gateway/api/create  (sandbox)
 *   https://payment.momo.vn/v2/gateway/api/create       (production)
 * Và trả về { qrCodeUrl, deeplink, ... } → frontend chỉ nhận và hiện QR.
 *
 * Backend cần:
 *   MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY
 *   (ký HMAC-SHA256 — không được để ở frontend)
 *
 * @param {{ orderId: string, amount: number, orderInfo?: string }}
 * @returns Promise<{ qrUrl: string, deeplink: string | null }>
 */
export async function createMoMoPayment({ orderId, amount, orderInfo }) {
  // ── MOCK ───────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 800));
  return {
    qrUrl:    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=momo://payment?orderId=${orderId}%26amount=${amount}`,
    deeplink: null, // MoMo app deeplink — backend sẽ trả thật
  };
  // ──────────────────────────────────────────────────────────────────────────

  // eslint-disable-next-line no-unreachable
  const res = await fetch("/api/payment/momo/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, amount, orderInfo }),
  });
  if (!res.ok) throw new Error("Không thể tạo thanh toán MoMo");
  return res.json(); // { qrUrl, deeplink }
}

// ─── ZaloPay ─────────────────────────────────────────────────────────────────

/**
 * Tạo đơn thanh toán ZaloPay
 *
 * MOCK: Trả về QR giả.
 * Khi Laravel xong, backend POST tới:
 *   https://sb-openapi.zalopay.vn/v2/create  (sandbox)
 *   https://openapi.zalopay.vn/v2/create     (production)
 * Và trả về { order_url, zp_trans_token, ... }
 *
 * Backend cần:
 *   ZALOPAY_APP_ID, ZALOPAY_KEY1, ZALOPAY_KEY2
 *   (ký HMAC-SHA256 — không được để ở frontend)
 *
 * @param {{ orderId: string, amount: number, description?: string }}
 * @returns Promise<{ qrUrl: string, orderUrl: string | null }>
 */
export async function createZaloPayPayment({ orderId, amount, description }) {
  // ── MOCK ───────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 800));
  return {
    qrUrl:    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=zalopay://payment?orderId=${orderId}%26amount=${amount}`,
    orderUrl: null, // ZaloPay order_url — backend sẽ trả thật
  };
  // ──────────────────────────────────────────────────────────────────────────

  // eslint-disable-next-line no-unreachable
  const res = await fetch("/api/payment/zalopay/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, amount, description }),
  });
  if (!res.ok) throw new Error("Không thể tạo thanh toán ZaloPay");
  return res.json(); // { qrUrl, orderUrl }
}

// ─── Poll payment status ──────────────────────────────────────────────────────

/**
 * Kiểm tra trạng thái thanh toán
 * MOCK: luôn trả "pending" — backend sẽ xử lý webhook thật.
 *
 * @returns Promise<{ status: "pending" | "paid" | "failed" | "expired" }>
 */
export async function getPaymentStatus(orderId) {
  // ── MOCK ───────────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 500));
  return { status: "pending" };
  // ──────────────────────────────────────────────────────────────────────────

  // eslint-disable-next-line no-unreachable
  const res = await fetch(`/api/orders/${orderId}/payment-status`);
  if (!res.ok) throw new Error("Không thể kiểm tra trạng thái thanh toán");
  return res.json();
}
