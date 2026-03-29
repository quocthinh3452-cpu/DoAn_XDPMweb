/* ─────────────────────────────────────────────────────────
   searchUtils.js — helpers, hooks, small components dùng trong Search
───────────────────────────────────────────────────────── */
import { useState, useEffect, useMemo } from "react";

/* ── Search history ── */
const HISTORY_KEY = "ts_search_history";
const MAX_HISTORY = 5;

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? []; }
  catch { return []; }
}
export function saveHistory(q) {
  if (!q?.trim()) return;
  const prev = getHistory().filter(h => h !== q);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...prev].slice(0, MAX_HISTORY))); }
  catch {}
}
export function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
}

/* ── useDebounce — chỉ dùng cho async search ── */
export function useDebounce(value, delay = 200) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

/* ── useLocalSearch — sync, không debounce, hiện ngay lập tức ── */
export function useLocalSearch(query, products = []) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !products.length) return [];
    return products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
      .slice(0, 7);
  }, [query, products]);
}

/* ── formatPrice ── */
export function fmt(n) {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M₫`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K₫`;
  return `${n}₫`;
}
