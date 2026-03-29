/**
 * usePaymentPolling.js
 *
 * Poll payment status mỗi `interval` ms cho đến khi:
 *   - status === "paid"    → gọi onSuccess
 *   - status === "failed"  → gọi onFailed
 *   - status === "expired" → gọi onExpired
 *   - maxAttempts đạt giới hạn → gọi onExpired
 *
 * Tự động dừng khi component unmount.
 */

import { useEffect, useRef, useState } from "react";
import { getPaymentStatus } from "../services/paymentService";

export function usePaymentPolling({
  orderId,
  enabled = true,
  interval = 3000,
  maxAttempts = 60,       // 60 × 3s = 3 phút
  onSuccess,
  onFailed,
  onExpired,
}) {
  const [status,   setStatus]   = useState("pending");
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !orderId) return;

    const poll = async () => {
      try {
        const res = await getPaymentStatus(orderId);
        setStatus(res.status);
        setAttempts((n) => n + 1);

        if (res.status === "paid") {
          onSuccess?.();
          return; // dừng
        }
        if (res.status === "failed") {
          onFailed?.();
          return;
        }
        if (res.status === "expired") {
          onExpired?.();
          return;
        }
      } catch {
        // network error — tiếp tục poll
      }

      // Kiểm tra maxAttempts
      setAttempts((n) => {
        if (n >= maxAttempts) { onExpired?.(); return n; }
        timerRef.current = setTimeout(poll, interval);
        return n;
      });
    };

    timerRef.current = setTimeout(poll, interval);

    return () => clearTimeout(timerRef.current);
  }, [orderId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, attempts };
}
