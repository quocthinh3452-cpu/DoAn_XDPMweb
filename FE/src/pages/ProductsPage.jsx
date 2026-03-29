import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getCategories } from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import { ProductCardSkeleton } from "../components/common/Skeleton";

/* ─── Constants ───────────────────────────────────────────── */
const DEFAULT_FILTERS = { category: "all", search: "", sort: "default", maxPrice: 2500 };

/* ─── Search input ────────────────────────────────────────── */
function SearchInput({ value, onChange }) {
  return (
    <div className="relative group">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none transition-colors group-focus-within:text-accent"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        placeholder="Search products…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-[300px] pl-10 pr-4 py-2.5 bg-surface border-[1.5px] border-border rounded-[10px] text-sm text-text placeholder:text-muted/50 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,111,247,0.12)] transition-all duration-200"
      />
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyState({ onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-5 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-3xl">🔍</div>
      <div>
        <p className="font-display text-lg font-bold text-text mb-1">No products found</p>
        <p className="text-sm text-muted">Try adjusting your filters or search term.</p>
      </div>
      <button
        onClick={onReset}
        className="px-5 py-2.5 bg-gradient-to-b from-[var(--color-accent-hl)] to-[var(--color-accent-dim)] text-white rounded-[10px] font-display font-semibold text-sm shadow-[0_4px_12px_rgba(108,95,255,0.35)] hover:shadow-[0_4px_16px_rgba(124,111,247,0.5)] transition-all"
      >
        Reset Filters
      </button>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function ProductsPage() {
  const [searchParams] = useSearchParams();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filters,    setFilters]    = useState(() => ({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") || "all",
  }));

  /* Sync category from URL (MegaMenu, Back/Forward) */
  useEffect(() => {
    const catFromUrl = searchParams.get("category");
    setFilters(f => ({ ...f, category: catFromUrl || "all" }));
  }, [searchParams]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProducts(filters)
      .then(r => setProducts(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="container-page py-14 pb-24">
      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-5 mb-10">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-display text-5xl2 font-extrabold tracking-tight text-text">All Products</h1>
          <p className="text-sm text-muted mt-1.5">
            {loading ? "Loading…" : `${products.length} products`}
          </p>
        </div>

        <SearchInput
          value={filters.search}
          onChange={val => setFilters(f => ({ ...f, search: val }))}
        />
      </div>

      {/* Layout */}
      <div className="flex gap-10 items-start">
        <ProductFilters categories={categories} filters={filters} onChange={setFilters} />

        <div className="flex-1 min-w-0">
          {error && <p className="text-red text-sm mb-4">⚠️ {error}</p>}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : products.length === 0 ? (
              <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
            ) : (
              products.map(p => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
