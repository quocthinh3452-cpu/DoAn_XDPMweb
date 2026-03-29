export const cn = (...args) => args.filter(Boolean).join(" ");

export const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);

const PHONE_RE = /^(0|\+84)\d{8,10}$/;

export function validateAddress(f) {
  const e = {};

  if (!f.name?.trim())
    e.name = "Vui lòng nhập họ tên";

  if (!f.phone?.trim() || !PHONE_RE.test(f.phone.replace(/\s/g, "")))
    e.phone = "Số điện thoại không hợp lệ";

  if (!f.provinceId)
    e.provinceId = "Vui lòng chọn tỉnh/thành phố";

  if (!f.districtId)
    e.districtId = "Vui lòng chọn quận/huyện";

  if (!f.wardCode)
    e.wardCode = "Vui lòng chọn phường/xã";

  if (!f.address?.trim())
    e.address = "Vui lòng nhập địa chỉ cụ thể";

  return e;
}