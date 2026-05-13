/**
 * ghnService.js
 *
 * Toggle mock/real bằng 1 biến duy nhất:
 *   const USE_MOCK = true   → dùng data giả, không cần token
 *   const USE_MOCK = false  → gọi GHN API thật
 *
 * Khi chuyển sang real, thêm vào .env:
 *   VITE_GHN_TOKEN=...
 *   VITE_GHN_SHOP_ID=...
 */

// ─── Toggle ───────────────────────────────────────────────────────────────────
const USE_MOCK = true; // ← đổi thành false khi có API thật

// ─── Config (chỉ dùng khi USE_MOCK = false) ──────────────────────────────────
const GHN_TOKEN   = import.meta.env.VITE_GHN_TOKEN   ?? "";
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID ?? 0;
const BASE        = "https://dev-online-gateway.ghn.vn/shiip/public-api"; // sandbox
// const BASE     = "https://online-gateway.ghn.vn/shiip/public-api";     // production

const headers = { "Content-Type": "application/json", Token: GHN_TOKEN };

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROVINCES = [
  { id: 201, name: "Hà Nội" },
  { id: 202, name: "TP. Hồ Chí Minh" },
  { id: 203, name: "Đà Nẵng" },
  { id: 204, name: "Hải Phòng" },
  { id: 205, name: "Cần Thơ" },
  { id: 206, name: "Bình Dương" },
  { id: 207, name: "Đồng Nai" },
];

const MOCK_DISTRICTS = {
  201: [ // Hà Nội
    { id: 1001, name: "Quận Hoàn Kiếm" },
    { id: 1002, name: "Quận Ba Đình" },
    { id: 1003, name: "Quận Đống Đa" },
    { id: 1004, name: "Quận Hai Bà Trưng" },
    { id: 1005, name: "Quận Cầu Giấy" },
  ],
  202: [ // TP.HCM
    { id: 1461, name: "Quận 1" },
    { id: 1462, name: "Quận 3" },
    { id: 1463, name: "Quận 5" },
    { id: 1464, name: "Quận 7" },
    { id: 1465, name: "Quận Bình Thạnh" },
    { id: 1466, name: "Quận Phú Nhuận" },
    { id: 1467, name: "Thành phố Thủ Đức" },
  ],
  203: [ // Đà Nẵng
    { id: 2001, name: "Quận Hải Châu" },
    { id: 2002, name: "Quận Thanh Khê" },
    { id: 2003, name: "Quận Sơn Trà" },
  ],
  204: [{ id: 3001, name: "Quận Hồng Bàng" }, { id: 3002, name: "Quận Lê Chân" }],
  205: [{ id: 4001, name: "Quận Ninh Kiều" }, { id: 4002, name: "Quận Bình Thủy" }],
  206: [{ id: 5001, name: "TP. Thủ Dầu Một" }, { id: 5002, name: "TP. Dĩ An" }],
  207: [{ id: 6001, name: "TP. Biên Hòa" }, { id: 6002, name: "Huyện Long Thành" }],
};

const MOCK_WARDS = {
  1461: [ // Q1 HCM
    { code: "20301", name: "Phường Bến Nghé" },
    { code: "20303", name: "Phường Bến Thành" },
    { code: "20305", name: "Phường Cầu Kho" },
    { code: "20307", name: "Phường Cầu Ông Lãnh" },
  ],
  1462: [
    { code: "20401", name: "Phường 1" },
    { code: "20402", name: "Phường 2" },
    { code: "20403", name: "Phường 3" },
  ],
  1463: [
    { code: "20501", name: "Phường 1" },
    { code: "20502", name: "Phường 2" },
    { code: "20503", name: "Phường 11" },
  ],
  1464: [
    { code: "20701", name: "Phường Tân Phú" },
    { code: "20702", name: "Phường Tân Quy" },
    { code: "20703", name: "Phường Phú Mỹ" },
  ],
  1465: [
    { code: "20801", name: "Phường 1" },
    { code: "20802", name: "Phường 12" },
    { code: "20803", name: "Phường 25" },
  ],
  1466: [
    { code: "20901", name: "Phường 1" },
    { code: "20902", name: "Phường 2" },
    { code: "20903", name: "Phường 9" },
  ],
  1467: [
    { code: "21001", name: "Phường Linh Trung" },
    { code: "21002", name: "Phường Hiệp Bình Chánh" },
    { code: "21003", name: "Phường An Khánh" },
  ],
  1001: [
    { code: "10001", name: "Phường Hàng Bạc" },
    { code: "10002", name: "Phường Hàng Bồ" },
    { code: "10003", name: "Phường Tràng Tiền" },
  ],
  1002: [
    { code: "10101", name: "Phường Cống Vị" },
    { code: "10102", name: "Phường Kim Mã" },
    { code: "10103", name: "Phường Trúc Bạch" },
  ],
  1003: [
    { code: "10201", name: "Phường Văn Miếu" },
    { code: "10202", name: "Phường Quốc Tử Giám" },
    { code: "10203", name: "Phường Hàng Bột" },
  ],
  1004: [
    { code: "10301", name: "Phường Bách Khoa" },
    { code: "10302", name: "Phường Đồng Tâm" },
  ],
  1005: [
    { code: "10401", name: "Phường Dịch Vọng" },
    { code: "10402", name: "Phường Mai Dịch" },
    { code: "10403", name: "Phường Nghĩa Đô" },
  ],
  2001: [{ code: "30101", name: "Phường Hải Châu 1" }, { code: "30102", name: "Phường Hải Châu 2" }],
  2002: [{ code: "30201", name: "Phường Thanh Khê Đông" }, { code: "30202", name: "Phường Xuân Hà" }],
  2003: [{ code: "30301", name: "Phường An Hải Bắc" }, { code: "30302", name: "Phường Mân Thái" }],
  3001: [{ code: "40101", name: "Phường Hoàng Văn Thụ" }],
  3002: [{ code: "40201", name: "Phường An Biên" }],
  4001: [{ code: "50101", name: "Phường An Hòa" }],
  4002: [{ code: "50201", name: "Phường Bình Thủy" }],
  5001: [{ code: "60101", name: "Phường Phú Cường" }],
  5002: [{ code: "60201", name: "Phường An Bình" }],
  6001: [{ code: "70101", name: "Phường Tân Phong" }],
  6002: [{ code: "70201", name: "Xã Long An" }],
};

const MOCK_SERVICES = [
  { id: 53321, name: "Hàng nhanh",      typeId: 2 },
  { id: 53320, name: "Hàng tiêu chuẩn", typeId: 5 },
];

function mockShipFee(serviceTypeId) {
  // Express đắt hơn, Standard rẻ hơn
  const base = serviceTypeId === 2 ? 35000 : 22000;
  return {
    fee: base,
    expectedDelivery: new Date(
      Date.now() + (serviceTypeId === 2 ? 2 : 4) * 86400000
    ).toISOString(),
  };
}

// ─── Helpers (real API) ───────────────────────────────────────────────────────
async function ghnGet(path, extraHeaders = {}) {
  const res  = await fetch(`${BASE}${path}`, { headers: { ...headers, ...extraHeaders } });
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.message ?? "GHN error");
  return json.data;
}

async function ghnPost(path, body, extraHeaders = {}) {
  const res  = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...headers, ...extraHeaders },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.message ?? "GHN error");
  return json.data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProvinces() {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_PROVINCES;
  }
  const data = await ghnGet("/master-data/province");
  return data.map((p) => ({ id: p.ProvinceID, name: p.ProvinceName }));
}

export async function getDistricts(provinceId) {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_DISTRICTS[provinceId] ?? [];
  }
  const data = await ghnPost("/master-data/district", { province_id: provinceId });
  return data.map((d) => ({ id: d.DistrictID, name: d.DistrictName }));
}

export async function getWards(districtId) {
  if (USE_MOCK) {
    await delay(350);
    return MOCK_WARDS[districtId] ?? [];
  }
  const data = await ghnPost("/master-data/ward", { district_id: districtId });
  return data.map((w) => ({ code: w.WardCode, name: w.WardName }));
}

export async function getAvailableServices({ toDistrictId }) {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_SERVICES;
  }
  const data = await ghnPost("/v2/shipping-order/available-services", {
    shop_id:       GHN_SHOP_ID,
    from_district: 1462, // ← thay bằng district_id kho hàng của bạn
    to_district:   toDistrictId,
  });
  return data.map((s) => ({ id: s.service_id, name: s.short_name, typeId: s.service_type_id }));
}

export async function calcShippingFee({ toDistrictId, toWardCode, serviceTypeId, weight = 500 }) {
  if (USE_MOCK) {
    await delay(500);
    return mockShipFee(serviceTypeId);
  }
  const data = await ghnPost(
    "/v2/shipping-order/fee",
    {
      shop_id:         GHN_SHOP_ID,
      service_type_id: serviceTypeId,
      to_district_id:  toDistrictId,
      to_ward_code:    toWardCode,
      weight,
    },
    { ShopId: String(GHN_SHOP_ID) },
  );
  return { fee: data.total, expectedDelivery: data.expected_delivery_time ?? null };
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));