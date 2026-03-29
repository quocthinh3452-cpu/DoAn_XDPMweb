/**
 * PaymentPage.jsx
 * Route: /payment/:orderId
 *
 * Hiện QR thanh toán cho VietQR / MoMo / ZaloPay.
 * Poll status mỗi 3 giây → navigate /order-success khi paid.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrder } from "../context/OrderContext";
import { usePaymentPolling } from "../hooks/usePaymentPolling";
import {
  buildVietQRUrl,
  getBankInfo,
  createMoMoPayment,
  createZaloPayPayment,
} from "../services/paymentService";

import "./PaymentPage.css";

const METHOD_LABEL = {
  vietqr: "VietQR / Chuyển khoản",
  momo:   "MoMo",
  zalopay: "ZaloPay",
};

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { currentOrder, updateOrderStatus } = useOrder();

  const [qrUrl,   setQrUrl]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [expired, setExpired] = useState(false);

  const method = currentOrder?.payment?.method ?? "vietqr";
  const amount = currentOrder?.total ?? 0;
  const bank   = getBankInfo();

  // ── Generate QR khi mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!currentOrder) return;

    const generate = async () => {
      setLoading(true);
      setError(null);
      try {
        if (method === "vietqr") {
          const url = buildVietQRUrl({ orderId, amount, description: `Thanh toan ${orderId}` });
          setQrUrl(url);
        } else if (method === "momo") {
          const res = await createMoMoPayment({ orderId, amount });
          setQrUrl(res.qrUrl);
        } else if (method === "zalopay") {
          const res = await createZaloPayPayment({ orderId, amount });
          setQrUrl(res.qrUrl);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll payment status ───────────────────────────────────────────────────
  usePaymentPolling({
    orderId,
    enabled: !!currentOrder && !expired,
    onSuccess: () => {
      updateOrderStatus("paid");
      navigate("/order-success");
    },
    onFailed: () => {
      setError("Thanh toán thất bại. Vui lòng thử lại.");
    },
    onExpired: () => setExpired(true),
  });

  // ── Guard: không có order → về trang chủ ─────────────────────────────────
  if (!currentOrder) {
    return (
      <div className="pay-page">
        <div className="pay-card pay-card--error">
          <p>Không tìm thấy đơn hàng.</p>
          <button className="pay-btn" onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-page">
      <div className="pay-card">
        {/* ── Header ── */}
        <div className="pay-header">
          <div className="pay-method-badge">{METHOD_LABEL[method] ?? method}</div>
          <h1 className="pay-title">Quét mã để thanh toán</h1>
          <p className="pay-order-id">Mã đơn: <strong>{orderId}</strong></p>
        </div>

        {/* ── QR ── */}
        <div className="pay-qr-wrap">
          {loading && <div className="pay-spinner" />}
          {!loading && error && <p className="pay-err">{error}</p>}
          {!loading && qrUrl && (
            <img className="pay-qr" src={qrUrl} alt="QR thanh toán" />
          )}
        </div>

        {/* ── Bank info (chỉ VietQR) ── */}
        {method === "vietqr" && (
          <div className="pay-bank-info">
            <div className="pay-bank-row">
              <span className="pay-bank-label">Ngân hàng</span>
              <span className="pay-bank-value">{bank.bankId}</span>
            </div>
            <div className="pay-bank-row">
              <span className="pay-bank-label">Số tài khoản</span>
              <strong className="pay-bank-value pay-bank-account">{bank.account}</strong>
            </div>
            <div className="pay-bank-row">
              <span className="pay-bank-label">Chủ tài khoản</span>
              <span className="pay-bank-value">{bank.accountName}</span>
            </div>
            <div className="pay-bank-row">
              <span className="pay-bank-label">Số tiền</span>
              <strong className="pay-bank-value pay-bank-amount">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
              </strong>
            </div>
            <div className="pay-bank-row">
              <span className="pay-bank-label">Nội dung CK</span>
              <strong className="pay-bank-value">Thanh toan {orderId}</strong>
            </div>
          </div>
        )}

        {/* ── Polling status ── */}
        {!expired && !error && (
          <div className="pay-polling">
            <span className="pay-pulse" />
            Đang chờ xác nhận thanh toán…
          </div>
        )}

        {/* ── Expired ── */}
        {expired && (
          <div className="pay-expired">
            <p>Phiên thanh toán đã hết hạn.</p>
            <button className="pay-btn" onClick={() => navigate("/cart")}>
              Quay lại giỏ hàng
            </button>
          </div>
        )}

        {/* ── Đã thanh toán rồi (manual confirm tạm) ── */}
        {!expired && !error && (
          <button
            className="pay-btn pay-btn--outline"
            onClick={() => { updateOrderStatus("paid"); navigate("/order-success"); }}
          >
            Tôi đã thanh toán
          </button>
        )}

        <button className="pay-btn-link" onClick={() => navigate("/cart")}>
          ← Quay lại giỏ hàng
        </button>
      </div>
    </div>
  );
}
