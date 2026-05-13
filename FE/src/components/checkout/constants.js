export const PROVINCES = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ",
  "Hải Phòng", "Bình Dương", "Đồng Nai", "Nha Trang",
  "Huế", "Vũng Tàu", "An Giang", "Đà Lạt",
];

export const SHIPPERS = [
  {
    id: "ghn",
    name: "Giao Hàng Nhanh",
    badge: "Nhanh nhất",
    badgeCls: "badge--orange",
    fee: { "TP. Hồ Chí Minh": 25000, "Hà Nội": 30000, default: 35000 },
    eta: { "TP. Hồ Chí Minh": "Hôm nay trước 22:00", "Hà Nội": "1–2 ngày", default: "2–3 ngày" },
  },
  {
    id: "ghtk",
    name: "Giao Hàng Tiết Kiệm",
    badge: "Tiết kiệm",
    badgeCls: "badge--green",
    fee: { "TP. Hồ Chí Minh": 18000, "Hà Nội": 22000, default: 28000 },
    eta: { "TP. Hồ Chí Minh": "1–2 ngày", "Hà Nội": "2–3 ngày", default: "3–5 ngày" },
  },
  {
    id: "vnpost",
    name: "VN Post",
    badge: "Toàn quốc",
    badgeCls: "badge--blue",
    fee: { "TP. Hồ Chí Minh": 15000, "Hà Nội": 18000, default: 22000 },
    eta: { "TP. Hồ Chí Minh": "2–3 ngày", "Hà Nội": "3–4 ngày", default: "4–7 ngày" },
  },
  {
    id: "grab",
    name: "Grab Express",
    badge: "Siêu tốc",
    badgeCls: "badge--teal",
    fee: { "TP. Hồ Chí Minh": 45000, "Hà Nội": 45000, default: null },
    eta: { "TP. Hồ Chí Minh": "1–2 giờ", "Hà Nội": "1–2 giờ", default: null },
  },
];

export const PAYMENTS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    desc: "Trả tiền mặt khi nhận. Không cần thanh toán trước.",
    info: "Đặt hàng ngay, thanh toán khi nhận. Không cần thẻ hay tài khoản.",
    infoColor: "rgba(34,197,94,0.9)",
    infoBg: "rgba(34,197,94,0.07)",
  },
  {
    id: "vietqr",
    label: "VietQR / Chuyển khoản",
    desc: "Mã QR hiển thị sau khi đặt. Đơn xác nhận khi nhận được tiền.",
    info: "Hỗ trợ: VCB · TCB · MB · BIDV",
    infoColor: "rgba(59,130,246,0.9)",
    infoBg: "rgba(59,130,246,0.07)",
  },
  {
    id: "wallet",
    label: "Ví điện tử",
    desc: "MoMo, ZaloPay, ShopeePay — voucher độc quyền áp dụng.",
    info: "Bạn sẽ được chuyển sang app ví để hoàn tất thanh toán.",
    infoColor: "rgba(234,179,8,0.9)",
    infoBg: "rgba(234,179,8,0.07)",
  },
];

export const COUPONS = {
  SAVE10: { label: "Giảm 10%",      apply: (s) => s * 0.10 },
  TECH20: { label: "Giảm 20%",      apply: (s) => s * 0.20 },
  FREE:   { label: "Miễn phí ship", apply: () => 0, freeShip: true },
};

export const TAX_RATE = 0.08;
export const FREE_SHIP_THRESHOLD = 500_000;
export const EMPTY_FORM = { name: "", phone: "", province: "", district: "", address: "", note: "" };
