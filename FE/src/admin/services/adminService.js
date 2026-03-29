// ============================================================
// ADMIN SERVICE
// All functions simulate network calls with setTimeout.
// Replace each body with a real fetch() to Laravel when ready.
// All admin routes require role=admin (via Laravel middleware:
//   Route::middleware(['auth:sanctum', 'role:admin'])->group(...)
// ============================================================

import { simulateDelay } from "../../services/apiClient";
import {
  DASHBOARD_STATS, REVENUE_CHART, CATEGORY_STATS,
  MOCK_ORDERS, MOCK_USERS, TOP_PRODUCTS,
} from "../data/mockData";
import { PRODUCTS } from "../../data/products";

// ── Local mutable state (simulates DB) ───────────────────────
let _orders   = [...MOCK_ORDERS];
let _products = PRODUCTS.map((p) => ({ ...p }));
let _users    = [...MOCK_USERS];

// ─────────────────────────────────────────────────────────────
// DASHBOARD  GET /api/admin/dashboard
// ─────────────────────────────────────────────────────────────
export async function getDashboardData() {
  await simulateDelay(500);
  return {
    data: {
      stats:         DASHBOARD_STATS,
      revenueChart:  REVENUE_CHART,
      categoryStats: CATEGORY_STATS,
      recentOrders:  _orders.slice(0, 5),
      topProducts:   TOP_PRODUCTS,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────
export async function getAdminOrders({ search = "", status = "all", page = 1, perPage = 10 } = {}) {
  await simulateDelay(400);
  let results = [..._orders];
  if (status !== "all") results = results.filter((o) => o.status === status);
  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
    );
  }
  const total = results.length;
  const data  = results.slice((page - 1) * perPage, page * perPage);
  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function updateOrderStatus(orderId, status) {
  await simulateDelay(500);
  _orders = _orders.map((o) => o.id === orderId ? { ...o, status } : o);
  return { data: _orders.find((o) => o.id === orderId) };
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────
export async function getAdminProducts({ search = "", category = "all", page = 1, perPage = 10 } = {}) {
  await simulateDelay(400);
  let results = [..._products];
  if (category !== "all") results = results.filter((p) => p.category === category);
  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }
  const total = results.length;
  const data  = results.slice((page - 1) * perPage, page * perPage);
  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createProduct(payload) {
  await simulateDelay(700);
  const newProduct = { ...payload, id: Date.now(), isNew: true, isFeatured: false, reviewCount: 0, rating: 0 };
  _products = [newProduct, ..._products];
  return { data: newProduct };
}

export async function updateProduct(id, payload) {
  await simulateDelay(600);
  _products = _products.map((p) => Number(p.id) === Number(id) ? { ...p, ...payload } : p);
  return { data: _products.find((p) => Number(p.id) === Number(id)) };
}

export async function deleteProduct(id) {
  await simulateDelay(500);
  _products = _products.filter((p) => Number(p.id) !== Number(id));
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────
export async function getAdminUsers({ search = "", status = "all", page = 1, perPage = 10 } = {}) {
  await simulateDelay(400);
  let results = [..._users];
  if (status !== "all") results = results.filter((u) => u.status === status);
  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  const total = results.length;
  const data  = results.slice((page - 1) * perPage, page * perPage);
  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}
