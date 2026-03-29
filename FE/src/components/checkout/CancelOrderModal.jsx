/**
 * CancelOrderModal.jsx
 *
 * Bước 1: Chọn lý do hủy + ghi chú tự do
 * Bước 2: Xác nhận — hiện thông tin hoàn tiền nếu đơn đã thanh toán online
 */

import { useState, useEffect, useRef } from "react";
import { REQUIRES_PAYMENT } from "../../services/orderService";
import { formatPrice } from "../../utils/helpers";

import "./CancelOrderModal.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const CANCEL_REASONS = [
  { id: "change_mind",     label: "Tôi muốn thay đổi sản phẩm/đơn hàng" },
  { id: "wrong_address",   label: "Tôi nhập sai địa chỉ giao hàng" },
  { id: "found_cheaper",   label: "Tôi tìm thấy giá rẻ hơn ở nơi khác" },
  { id: "wait_too_long",   label: "Thời gian giao hàng quá lâu" },
  { id: "duplicate_order", label: "Tôi đặt hàng bị trùng" },
  { id: "other",           label: "Lý do khác" },
];

const REFUND_DAYS = { vietqr: "3–5 ngày làm việc", momo: "1–3 ngày làm việc", zalopay: "1–3 ngày làm việc" };

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }) {
  return (
    <div className="cm-steps">
      {[1, 2].map((s) => (
        <div key={s} className={`cm-step-dot ${step >= s ? "cm-step-dot--active" : ""}`} />
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function CancelOrderModal({ order, onConfirm, onClose, loading }) {
  const [step,   setStep]   = useState(1);
  const [reason, setReason] = useState("");
  const [note,   setNote]   = useState("");
  const backdropRef = useRef(null);

  const paymentMethod  = order.payment.method;
  const needsRefund    = REQUIRES_PAYMENT.includes(paymentMethod);
  const refundAmount   = needsRefund ? order.total : 0;
  const refundDays     = REFUND_DAYS[paymentMethod] ?? "3–5 ngày làm việc";
  const selectedReason = CANCEL_REASONS.find((r) => r.id === reason);
  const canNext        = !!reason;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleConfirm = () => {
    onConfirm({ reason, note: note.trim() });
  };

  return (
    <div className="cm-backdrop" ref={backdropRef} onClick={handleBackdrop}>
      <div className="cm-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="cm-header">
          <h2 className="cm-title">Hủy đơn hàng</h2>
          <button className="cm-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <StepDots step={step} />

        {/* ── Bước 1: Lý do ── */}
        {step === 1 && (
          <div className="cm-body">
            <p className="cm-order-ref">Đơn hàng <strong>#{order.id}</strong></p>
            <p className="cm-label">Lý do hủy đơn <span className="cm-required">*</span></p>

            <div className="cm-reasons">
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`cm-reason ${reason === r.id ? "cm-reason--active" : ""}`}
                  onClick={() => setReason(r.id)}
                >
                  <span className="cm-reason-radio">
                    {reason === r.id && <span className="cm-reason-dot" />}
                  </span>
                  {r.label}
                </button>
              ))}
            </div>

            <p className="cm-label" style={{ marginTop: "1rem" }}>Ghi chú thêm (tùy chọn)</p>
            <textarea
              className="cm-textarea"
              placeholder="Mô tả thêm nếu cần…"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
            />
            <p className="cm-char-count">{note.length}/300</p>
          </div>
        )}

        {/* ── Bước 2: Xác nhận ── */}
        {step === 2 && (
          <div className="cm-body">
            <div className="cm-confirm-icon">⚠️</div>
            <p className="cm-confirm-title">Xác nhận hủy đơn?</p>
            <p className="cm-confirm-sub">
              Bạn đang hủy đơn <strong>#{order.id}</strong>.<br />
              Hành động này không thể hoàn tác.
            </p>

            {/* Lý do đã chọn */}
            <div className="cm-confirm-box">
              <div className="cm-confirm-row">
                <span className="cm-confirm-label">Lý do</span>
                <span className="cm-confirm-value">{selectedReason?.label}</span>
              </div>
              {note && (
                <div className="cm-confirm-row">
                  <span className="cm-confirm-label">Ghi chú</span>
                  <span className="cm-confirm-value">{note}</span>
                </div>
              )}
            </div>

            {/* Hoàn tiền — chỉ hiện nếu đã thanh toán online */}
            {needsRefund ? (
              <div className="cm-refund-box">
                <div className="cm-refund-header">
                  <span className="cm-refund-icon">💰</span>
                  <span className="cm-refund-title">Thông tin hoàn tiền</span>
                </div>
                <div className="cm-refund-rows">
                  <div className="cm-refund-row">
                    <span>Số tiền hoàn</span>
                    <strong className="cm-refund-amount">{formatPrice(refundAmount)}</strong>
                  </div>
                  <div className="cm-refund-row">
                    <span>Phương thức</span>
                    <span>Hoàn về ví / tài khoản gốc</span>
                  </div>
                  <div className="cm-refund-row">
                    <span>Thời gian dự kiến</span>
                    <span>{refundDays}</span>
                  </div>
                </div>
                <p className="cm-refund-note">
                  * Thời gian thực tế có thể thay đổi tùy ngân hàng/ví điện tử.
                </p>
              </div>
            ) : (
              <div className="cm-no-refund-box">
                <span>💵</span>
                <span>Đơn COD — không cần hoàn tiền.</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="cm-footer">
          {step === 1 ? (
            <>
              <button className="cm-btn cm-btn--ghost" onClick={onClose}>Đóng</button>
              <button
                className="cm-btn cm-btn--primary"
                disabled={!canNext}
                onClick={() => setStep(2)}
              >
                Tiếp theo →
              </button>
            </>
          ) : (
            <>
              <button className="cm-btn cm-btn--ghost" onClick={() => setStep(1)} disabled={loading}>
                ← Quay lại
              </button>
              <button
                className="cm-btn cm-btn--danger"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Đang hủy…" : "Xác nhận hủy đơn"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
