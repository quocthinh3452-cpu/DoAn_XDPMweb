/**
 * useShippingServices.js
 *
 * Load danh sách dịch vụ vận chuyển GHN khi user đã chọn đủ districtId.
 * Reset khi districtId thay đổi.
 */

import { useState, useEffect } from "react";
import { getAvailableServices } from "../services/ghnService";

export function useShippingServices(districtId) {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!districtId) {
      setServices([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setServices([]);

    getAvailableServices({ toDistrictId: districtId })
      .then((data) => { if (!cancelled) setServices(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [districtId]);

  return { services, loading, error };
}
