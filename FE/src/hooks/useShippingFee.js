/**
 * useShippingFee.js
 *
 * Tự động tính phí ship khi đủ districtId + wardCode + serviceTypeId.
 * Debounce 400ms để tránh spam API.
 *
 * Returns:
 *   fee      number | null
 *   eta      string | null   (expected_delivery_time từ GHN)
 *   loading  boolean
 *   error    string | null
 */

import { useState, useEffect, useRef } from "react";
import { calcShippingFee } from "../services/ghnService";

export function useShippingFee({ districtId, wardCode, serviceTypeId, weight = 500 }) {
  const [fee,     setFee]     = useState(null);
  const [eta,     setEta]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Cần đủ 3 thông tin mới tính được
    if (!districtId || !wardCode || !serviceTypeId) {
      setFee(null);
      setEta(null);
      setError(null);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await calcShippingFee({
          toDistrictId:  districtId,
          toWardCode:    wardCode,
          serviceTypeId,
          weight,
        });
        setFee(result.fee);
        setEta(result.expectedDelivery ?? null);
      } catch (err) {
        setError(err.message);
        setFee(null);
        setEta(null);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [districtId, wardCode, serviceTypeId, weight]);

  return { fee, eta, loading, error };
}
