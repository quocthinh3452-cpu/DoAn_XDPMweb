export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price ?? 0);

export const calcDiscount = (original, current) =>
  original > current ? Math.round(((original - current) / original) * 100) : 0;

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");