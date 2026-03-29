/**
 * useAddressData.js
 *
 * Quản lý 3 dropdown địa chỉ phụ thuộc nhau:
 *   Tỉnh/Thành → Quận/Huyện → Phường/Xã
 *
 * Mỗi lần chọn cấp trên → reset + load lại cấp dưới.
 */

import { useState, useEffect } from "react";
import { getProvinces, getDistricts, getWards } from "../services/ghnService";

export function useAddressData(form, onChange) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards,     setWards]     = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards,     setLoadingWards]     = useState(false);

  const [error, setError] = useState(null);

  // ── Load tỉnh một lần khi mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingProvinces(true);
    getProvinces()
      .then((data) => { if (!cancelled) setProvinces(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoadingProvinces(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Load quận khi chọn tỉnh ───────────────────────────────────────────────
  useEffect(() => {
    if (!form.provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }
    let cancelled = false;
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    getDistricts(form.provinceId)
      .then((data) => { if (!cancelled) setDistricts(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoadingDistricts(false); });
    return () => { cancelled = true; };
  }, [form.provinceId]);

  // ── Load phường khi chọn quận ─────────────────────────────────────────────
  useEffect(() => {
    if (!form.districtId) {
      setWards([]);
      return;
    }
    let cancelled = false;
    setLoadingWards(true);
    setWards([]);
    getWards(form.districtId)
      .then((data) => { if (!cancelled) setWards(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoadingWards(false); });
    return () => { cancelled = true; };
  }, [form.districtId]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleProvinceChange = (id, name) => {
    onChange("provinceId",   id);
    onChange("provinceName", name);
    onChange("districtId",   "");
    onChange("districtName", "");
    onChange("wardCode",     "");
    onChange("wardName",     "");
  };

  const handleDistrictChange = (id, name) => {
    onChange("districtId",   id);
    onChange("districtName", name);
    onChange("wardCode",     "");
    onChange("wardName",     "");
  };

  const handleWardChange = (code, name) => {
    onChange("wardCode", code);
    onChange("wardName", name);
  };

  return {
    provinces, districts, wards,
    loadingProvinces, loadingDistricts, loadingWards,
    error,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
  };
}
