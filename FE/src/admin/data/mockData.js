// ============================================================
// ADMIN MOCK DATA
// BUG FIX: TOP_PRODUCTS previously used Math.random() at module
// level → values reshuffled on every hot reload. Now uses a
// deterministic pseudo-random seeded by product id.
// ============================================================

import { PRODUCTS } from "../../data/products";

export const DASHBOARD_STATS = [
  { id: "revenue",   label: "Total Revenue", value: 124850, unit: "$", change: +18.4, icon: "💰" },
  { id: "orders",    label: "Total Orders",  value: 1284,   unit: "",  change: +12.1, icon: "📦" },
  { id: "customers", label: "Customers",     value: 876,    unit: "",  change: +9.3,  icon: "👥" },
  { id: "products",  label: "Products",      value: PRODUCTS.length, unit: "", change: 0, icon: "📱" },
];

export const REVENUE_CHART = [
  { month: "Aug", revenue: 68400,  orders: 720  },
  { month: "Sep", revenue: 74200,  orders: 810  },
  { month: "Oct", revenue: 81900,  orders: 890  },
  { month: "Nov", revenue: 98300,  orders: 1050 },
  { month: "Dec", revenue: 143200, orders: 1540 },
  { month: "Jan", revenue: 109800, orders: 1190 },
  { month: "Feb", revenue: 124850, orders: 1284 },
];

export const CATEGORY_STATS = [
  { name: "Smartphones", revenue: 64200, percent: 51, color: "#6c63ff" },
  { name: "Laptops",     revenue: 28800, percent: 23, color: "#22c55e" },
  { name: "Audio",       revenue: 19400, percent: 16, color: "#ff6584" },
  { name: "Tablets",     revenue: 8700,  percent: 7,  color: "#f59e0b" },
  { name: "Wearables",   revenue: 3750,  percent: 3,  color: "#60a5fa" },
];

export const MOCK_ORDERS = [
  { id: "TS-M3X7P-K2QR", customerName: "Nguyen Van A", email: "nguyenvana@gmail.com", items: [{ name: "iPhone 15 Pro Max", quantity: 1, price: 1199 }], total: 1314.12, status: "delivered",  paymentMethod: "cod",           createdAt: "2025-02-14T09:23:00Z", city: "Ho Chi Minh City" },
  { id: "TS-N4Y8Q-L3RS", customerName: "Tran Thi B",   email: "tranthib@gmail.com",   items: [{ name: "Samsung Galaxy S24 Ultra", quantity: 1, price: 1099 }, { name: "AirPods Pro (2nd gen)", quantity: 1, price: 229 }], total: 1461.12, status: "shipped",   paymentMethod: "bank_transfer", createdAt: "2025-02-15T14:10:00Z", city: "Ha Noi" },
  { id: "TS-O5Z9R-M4TU", customerName: "Le Van C",     email: "levanc@yahoo.com",     items: [{ name: 'MacBook Pro 14"', quantity: 1, price: 1999 }], total: 2174.92, status: "processing", paymentMethod: "ewallet",       createdAt: "2025-02-16T08:45:00Z", city: "Da Nang" },
  { id: "TS-P6A1S-N5UV", customerName: "Pham Thi D",   email: "phamthid@gmail.com",   items: [{ name: "Sony WH-1000XM5", quantity: 2, price: 349 }], total: 773.92, status: "confirmed",  paymentMethod: "cod",           createdAt: "2025-02-17T11:30:00Z", city: "Can Tho" },
  { id: "TS-Q7B2T-O6VW", customerName: "Hoang Van E",  email: "hoangvane@gmail.com",  items: [{ name: "Google Pixel 8 Pro", quantity: 1, price: 799 }], total: 878.92, status: "confirmed",  paymentMethod: "bank_transfer", createdAt: "2025-02-18T16:20:00Z", city: "Bien Hoa" },
  { id: "TS-R8C3U-P7WX", customerName: "Do Thi F",     email: "dothif@outlook.com",   items: [{ name: 'iPad Pro 12.9"', quantity: 1, price: 1099 }, { name: "Samsung Galaxy Watch 6", quantity: 1, price: 279 }], total: 1498.12, status: "delivered",  paymentMethod: "ewallet",       createdAt: "2025-02-18T09:00:00Z", city: "Hue" },
  { id: "TS-S9D4V-Q8XY", customerName: "Vo Van G",     email: "vovang@gmail.com",     items: [{ name: "AirPods Pro (2nd gen)", quantity: 3, price: 229 }], total: 756.36, status: "cancelled", paymentMethod: "cod",           createdAt: "2025-02-13T12:00:00Z", city: "Nha Trang" },
];

export const MOCK_USERS = [
  { id: 1, name: "Nguyen Van A", email: "nguyenvana@gmail.com", orders: 5,  spent: 4820.50,  joinedAt: "2024-06-10", status: "active"   },
  { id: 2, name: "Tran Thi B",   email: "tranthib@gmail.com",   orders: 3,  spent: 2943.12,  joinedAt: "2024-07-22", status: "active"   },
  { id: 3, name: "Le Van C",     email: "levanc@yahoo.com",     orders: 8,  spent: 7610.00,  joinedAt: "2024-05-01", status: "active"   },
  { id: 4, name: "Pham Thi D",   email: "phamthid@gmail.com",   orders: 1,  spent: 773.92,   joinedAt: "2024-11-15", status: "active"   },
  { id: 5, name: "Hoang Van E",  email: "hoangvane@gmail.com",  orders: 2,  spent: 1878.92,  joinedAt: "2024-09-03", status: "active"   },
  { id: 6, name: "Do Thi F",     email: "dothif@outlook.com",   orders: 4,  spent: 3890.00,  joinedAt: "2024-08-19", status: "active"   },
  { id: 7, name: "Vo Van G",     email: "vovang@gmail.com",     orders: 0,  spent: 0,        joinedAt: "2025-01-05", status: "inactive" },
  { id: 8, name: "Bui Thi H",    email: "buithih@gmail.com",    orders: 12, spent: 11200.00, joinedAt: "2024-03-14", status: "active"   },
];

// Deterministic seeded pseudo-random — no reshuffling on hot reload
const seededRand = (seed) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); };

export const TOP_PRODUCTS = PRODUCTS
  .map((p) => { const sold = Math.floor(seededRand(Number(p.id) || 1) * 70) + 10; return { ...p, sold, revenue: p.price * sold }; })
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);
