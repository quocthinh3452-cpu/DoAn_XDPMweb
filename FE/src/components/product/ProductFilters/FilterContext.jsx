/**
 * FilterContext.jsx
 * Single source of truth: constants, DEFAULT_FILTERS, helpers.
 * Không có UI — import từ bất kỳ filter component nào.
 */

/* ── Sort options ──────────────────────────────────────── */
export const SORT_OPTIONS = [
  { value: "default",    label: "Mặc định"             },
  { value: "price_asc",  label: "Giá: Thấp → Cao"      },
  { value: "price_desc", label: "Giá: Cao → Thấp"      },
  { value: "rating",     label: "Đánh giá cao nhất"    },
  { value: "newest",     label: "Mới nhất"              },
  { value: "discount",   label: "Giảm giá nhiều nhất"  },
  { value: "popular",    label: "Phổ biến nhất"         },
];

/* ── Default filter state ──────────────────────────────── */
export const DEFAULT_FILTERS = {
  category:    null,       // string | null
  brands:      [],         // string[]
  sort:        "default",  // string
  minPrice:    0,          // number
  maxPrice:    50_000_000, // number
  inStockOnly: false,      // boolean

  // Tình trạng hàng
  condition:   null,       // "new" | "refurbished" | null
  preOrder:    false,
  flashSale:   false,

  // Bảo hành
  warranty:    null,       // "official" | "shop" | null

  // Phiên bản
  version:     null,       // "vna" | "international" | null

  // Specs kỹ thuật
  storages:    [],         // string[]  — ["128GB","256GB"]
  rams:        [],         // string[]  — ["8GB","12GB"]
  colors:      [],         // string[]  — hex values
  chips:       [],         // string[]  — ["A18 Pro","Snapdragon 8 Gen 3"]
  batteryMin:  0,          // number    — mAh tối thiểu

  // Tiện ích mua hàng
  installment: false,      // trả góp 0%
  hasCharger:  null,       // true | false | null — có sạc kèm
};

/* ── Count active filters ──────────────────────────────── */
export function countActiveFilters(filters, priceRange = { min: 0, max: 50_000_000 }) {
  let n = 0;
  if (filters.category)                            n++;
  if (filters.brands?.length)                      n++;
  if (filters.sort && filters.sort !== "default")  n++;
  if ((filters.minPrice ?? 0) > priceRange.min)    n++;
  if ((filters.maxPrice ?? priceRange.max) < priceRange.max) n++;
  if (filters.inStockOnly)                         n++;
  if (filters.preOrder)                            n++;
  if (filters.flashSale)                           n++;
  if (filters.condition)                           n++;
  if (filters.warranty)                            n++;
  if (filters.version)                             n++;
  if (filters.storages?.length)                    n++;
  if (filters.rams?.length)                        n++;
  if (filters.colors?.length)                      n++;
  if (filters.chips?.length)                       n++;
  if ((filters.batteryMin ?? 0) > 0)               n++;
  if (filters.installment)                         n++;
  if (filters.hasCharger !== null && filters.hasCharger !== undefined) n++;
  return n;
}

/* ── Reset to default ──────────────────────────────────── */
export function makeDefaultFilters(priceRange = { min: 0, max: 50_000_000 }) {
  return {
    ...DEFAULT_FILTERS,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  };
}

/* ── Format price for display ──────────────────────────── */
export function formatPrice(n) {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

/* ── Filter label for active badge display ─────────────── */
export function getFilterLabels(filters, { brands = [], categories = [] } = {}) {
  const labels = [];
  if (filters.category) {
    const cat = categories.find(c => c.id === filters.category);
    if (cat) labels.push({ key: "category", label: cat.label });
  }
  if (filters.brands?.length) {
    filters.brands.forEach(id => {
      const b = brands.find(b => b.id === id);
      if (b) labels.push({ key: `brand-${id}`, label: b.name });
    });
  }
  if (filters.condition === "refurbished") labels.push({ key: "condition", label: "Trưng bày" });
  if (filters.preOrder)    labels.push({ key: "preOrder",    label: "Pre-order" });
  if (filters.flashSale)   labels.push({ key: "flashSale",   label: "Flash sale" });
  if (filters.warranty)    labels.push({ key: "warranty",    label: filters.warranty === "official" ? "BH chính hãng" : "BH shop" });
  if (filters.version)     labels.push({ key: "version",     label: filters.version === "vna" ? "VN/A" : "Quốc tế" });
  if (filters.installment) labels.push({ key: "installment", label: "Trả góp 0%" });
  if (filters.storages?.length)  labels.push({ key: "storages", label: filters.storages.join(", ") });
  if (filters.rams?.length)      labels.push({ key: "rams",     label: filters.rams.join(", ") });
  if (filters.batteryMin > 0)    labels.push({ key: "battery",  label: `Pin ≥ ${filters.batteryMin}mAh` });
  return labels;
}
