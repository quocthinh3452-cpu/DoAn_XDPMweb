/**
 * AddressSection.jsx
 *
 * 3 dropdown địa chỉ load động từ GHN:
 *   Tỉnh/Thành → Quận/Huyện → Phường/Xã
 *
 * form shape mới:
 *   { name, phone, provinceId, provinceName, districtId, districtName, wardCode, wardName, address, note }
 */

import { Icons } from "./icons.jsx";
import { SectionTitle, InputWrap, Field, ValidMark } from "./primitives.jsx";
import { useAddressData } from "../../hooks/useAddressData.js";

export default function AddressSection({ form, errors, touched, focused, onChange, onBlur, onFocus }) {
  const {
    provinces, districts, wards,
    loadingProvinces, loadingDistricts, loadingWards,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
  } = useAddressData(form, onChange);

  return (
    <div className="cc-card">
      <SectionTitle number="2" title="Địa chỉ giao hàng" subtitle="Chúng tôi sẽ giao đến địa chỉ này" />

      <div className="cc-grid2">

        {/* ── Họ tên ── */}
        <Field label="Họ và tên" required error={errors.name} touched={touched.name}>
          <InputWrap icon={<Icons.User />} error={touched.name && errors.name} focused={focused === "name"}>
            <input
              className="cc-input" type="text" value={form.name}
              placeholder="Nguyễn Văn A"
              onChange={(e) => onChange("name", e.target.value)}
              onFocus={() => onFocus("name")} onBlur={() => onBlur("name")}
            />
            <ValidMark show={!errors.name && touched.name && !!form.name} />
          </InputWrap>
        </Field>

        {/* ── Điện thoại ── */}
        <Field label="Số điện thoại" required error={errors.phone} touched={touched.phone}>
          <InputWrap icon={<Icons.Phone />} error={touched.phone && errors.phone} focused={focused === "phone"}>
            <input
              className="cc-input" type="tel" value={form.phone}
              placeholder="0901 234 567"
              onChange={(e) => onChange("phone", e.target.value)}
              onFocus={() => onFocus("phone")} onBlur={() => onBlur("phone")}
            />
            <ValidMark show={!errors.phone && touched.phone && !!form.phone} />
          </InputWrap>
        </Field>

        {/* ── Tỉnh/Thành ── */}
        <Field label="Tỉnh / Thành phố" required error={errors.provinceId} touched={touched.provinceId}>
          <InputWrap icon={<Icons.City />} error={touched.provinceId && errors.provinceId} focused={focused === "provinceId"}>
            <select
              className="cc-input cc-select"
              value={form.provinceId ?? ""}
              disabled={loadingProvinces}
              onChange={(e) => {
                const opt = e.target.options[e.target.selectedIndex];
                handleProvinceChange(Number(e.target.value), opt.text);
              }}
              onFocus={() => onFocus("provinceId")}
              onBlur={() => onBlur("provinceId")}
            >
              <option value="">{loadingProvinces ? "Đang tải…" : "Chọn tỉnh/thành…"}</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </InputWrap>
        </Field>

        {/* ── Quận/Huyện ── */}
        <Field label="Quận / Huyện" required error={errors.districtId} touched={touched.districtId}>
          <InputWrap icon={<Icons.MapPin />} error={touched.districtId && errors.districtId} focused={focused === "districtId"}>
            <select
              className="cc-input cc-select"
              value={form.districtId ?? ""}
              disabled={!form.provinceId || loadingDistricts}
              onChange={(e) => {
                const opt = e.target.options[e.target.selectedIndex];
                handleDistrictChange(Number(e.target.value), opt.text);
              }}
              onFocus={() => onFocus("districtId")}
              onBlur={() => onBlur("districtId")}
            >
              <option value="">
                {!form.provinceId ? "Chọn tỉnh trước" : loadingDistricts ? "Đang tải…" : "Chọn quận/huyện…"}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </InputWrap>
        </Field>

        {/* ── Phường/Xã ── */}
        <Field label="Phường / Xã" required error={errors.wardCode} touched={touched.wardCode}>
          <InputWrap icon={<Icons.MapPin />} error={touched.wardCode && errors.wardCode} focused={focused === "wardCode"}>
            <select
              className="cc-input cc-select"
              value={form.wardCode ?? ""}
              disabled={!form.districtId || loadingWards}
              onChange={(e) => {
                const opt = e.target.options[e.target.selectedIndex];
                handleWardChange(e.target.value, opt.text);
              }}
              onFocus={() => onFocus("wardCode")}
              onBlur={() => onBlur("wardCode")}
            >
              <option value="">
                {!form.districtId ? "Chọn quận trước" : loadingWards ? "Đang tải…" : "Chọn phường/xã…"}
              </option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
          </InputWrap>
        </Field>

        {/* ── Địa chỉ cụ thể ── */}
        <div className="cc-full">
          <Field label="Địa chỉ cụ thể" required error={errors.address} touched={touched.address}>
            <InputWrap icon={<Icons.MapPin />} error={touched.address && errors.address} focused={focused === "address"}>
              <input
                className="cc-input" type="text" value={form.address}
                placeholder="Số nhà, tên đường"
                onChange={(e) => onChange("address", e.target.value)}
                onFocus={() => onFocus("address")} onBlur={() => onBlur("address")}
              />
              <ValidMark show={!errors.address && touched.address && !!form.address} />
            </InputWrap>
          </Field>
        </div>

        {/* ── Ghi chú ── */}
        <div className="cc-full">
          <Field label="Ghi chú (tùy chọn)">
            <InputWrap icon={<Icons.Note />} focused={focused === "note"}>
              <input
                className="cc-input" type="text" value={form.note}
                placeholder="Gọi trước khi giao, để trước cửa…"
                onChange={(e) => onChange("note", e.target.value)}
                onFocus={() => onFocus("note")} onBlur={() => onBlur("note")}
              />
            </InputWrap>
          </Field>
        </div>

      </div>
    </div>
  );
}
