// ============================================================
// ADMIN SERVICE — v2
// FIXES:
//   - _orders/_users/_products initialised with spread copies
//     (not re-imported refs) so mutations never corrupt source data
//   - updateOrderStatus now throws if id not found
//   - deleteProduct throws if id not found
//   - All list functions accept sortKey/sortDir from caller
//   - Orders accept dateFrom/dateTo for date-range filtering
//   - Products accept stockFilter: "all"|"out"|"low"|"ok"
//   - New: toggleUserStatus (active ↔ inactive)
// ============================================================

import { simulateDelay } from "../../services/apiClient";
import { DASHBOARD_STATS, REVENUE_CHART, CATEGORY_STATS, MOCK_ORDERS, MOCK_USERS, TOP_PRODUCTS } from "../data/mockData";
import { PRODUCTS } from "../../data/products";

let _orders   = MOCK_ORDERS.map((o) => ({ ...o }));
let _products = PRODUCTS.map((p) => ({ ...p }));
let _users    = MOCK_USERS.map((u) => ({ ...u }));

// ── Dashboard ────────────────────────────────────────────────
export async function getDashboardData() {
  await simulateDelay(500);
  return { data: { stats: DASHBOARD_STATS, revenueChart: REVENUE_CHART, categoryStats: CATEGORY_STATS, recentOrders: _orders.slice(0, 5), topProducts: TOP_PRODUCTS } };
}

// ── Orders ───────────────────────────────────────────────────
export async function getAdminOrders({ search = "", status = "all", page = 1, perPage = 10, dateFrom = null, dateTo = null, sortKey = "createdAt", sortDir = "desc" } = {}) {
  await simulateDelay(400);
  let r = _orders.slice();
  if (status !== "all") r = r.filter((o) => o.status === status);
  if (search.trim()) { const q = search.toLowerCase(); r = r.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)); }
  if (dateFrom) { const from = new Date(dateFrom).getTime(); r = r.filter((o) => new Date(o.createdAt).getTime() >= from); }
  if (dateTo)   { const to   = new Date(dateTo).getTime() + 86_400_000; r = r.filter((o) => new Date(o.createdAt).getTime() <= to); }
  r.sort((a, b) => { let av = a[sortKey], bv = b[sortKey]; if (sortKey === "createdAt") { av = new Date(av); bv = new Date(bv); } return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); });
  const total = r.length;
  return { data: r.slice((page - 1) * perPage, page * perPage), total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function updateOrderStatus(orderId, status) {
  await simulateDelay(500);
  let updated = null;
  _orders = _orders.map((o) => { if (o.id !== orderId) return o; updated = { ...o, status }; return updated; });
  if (!updated) throw new Error(`Order ${orderId} not found`);
  return { data: updated };
}

// ── Products ─────────────────────────────────────────────────
export async function getAdminProducts({ search = "", category = "all", page = 1, perPage = 10, sortKey = "name", sortDir = "asc", stockFilter = "all" } = {}) {
  await simulateDelay(400);
  let r = _products.slice();
  if (category !== "all") r = r.filter((p) => p.category === category);
  if (search.trim()) { const q = search.toLowerCase(); r = r.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)); }
  if (stockFilter === "out") r = r.filter((p) => p.stock === 0);
  else if (stockFilter === "low") r = r.filter((p) => p.stock > 0 && p.stock < 5);
  else if (stockFilter === "ok")  r = r.filter((p) => p.stock >= 5);
  r.sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); });
  const total = r.length;
  return { data: r.slice((page - 1) * perPage, page * perPage), total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function createProduct(payload) {
  await simulateDelay(700);
  const p = { ...payload, id: Date.now(), isNew: true, isFeatured: false, reviewCount: 0, rating: 0 };
  _products = [p, ..._products];
  return { data: p };
}

export async function updateProduct(id, payload) {
  await simulateDelay(600);
  let updated = null;
  _products = _products.map((p) => { if (Number(p.id) !== Number(id)) return p; updated = { ...p, ...payload }; return updated; });
  if (!updated) throw new Error(`Product ${id} not found`);
  return { data: updated };
}

export async function deleteProduct(id) {
  await simulateDelay(500);
  const before = _products.length;
  _products = _products.filter((p) => Number(p.id) !== Number(id));
  if (_products.length === before) throw new Error(`Product ${id} not found`);
  return { success: true };
}

// ── Users ────────────────────────────────────────────────────
export async function getAdminUsers({ search = "", status = "all", page = 1, perPage = 10, sortKey = "spent", sortDir = "desc" } = {}) {
  await simulateDelay(400);
  let r = _users.slice();
  if (status !== "all") r = r.filter((u) => u.status === status);
  if (search.trim()) { const q = search.toLowerCase(); r = r.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)); }
  r.sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); });
  const total = r.length;
  return { data: r.slice((page - 1) * perPage, page * perPage), total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

// NEW: PATCH /api/admin/users/:id/toggle-status
export async function toggleUserStatus(userId) {
  await simulateDelay(400);
  let updated = null;
  _users = _users.map((u) => { if (u.id !== userId) return u; updated = { ...u, status: u.status === "active" ? "inactive" : "active" }; return updated; });
  if (!updated) throw new Error(`User ${userId} not found`);
  return { data: updated };
}
