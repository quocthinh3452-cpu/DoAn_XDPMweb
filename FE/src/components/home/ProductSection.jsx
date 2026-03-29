/**
 * ProductSection.jsx — v2
 *
 * Fixes:
 *  1. Guard tabs=[]       — return null sớm, không crash
 *  2. Single source       — activeKey + current từ 1 biến, không lệch nhau
 *  3. Tab fade transition — grid fade out/in khi đổi tab, GPU only
 *  4. skeletonCount prop  — không hardcode 4, linh hoạt theo layout
 */
import { useState, useEffect, useRef } from "react";
import { Link }    from "react-router-dom";
import { cn }      from "../../utils/cn";
import ProductCard from "../product/ProductCard";
import { ProductCardSkeleton } from "../common/Skeleton";

export default function ProductSection({
  eyebrow,
  title,
  tabs,
  loading,
  viewAllLink,
  skeletonCount = 4, // 4. prop thay vì hardcode
}) {
  // 1. Guard — không render gì nếu không có tabs
  if (!tabs?.length) return null;

  return <Inner
    eyebrow={eyebrow}
    title={title}
    tabs={tabs}
    loading={loading}
    viewAllLink={viewAllLink}
    skeletonCount={skeletonCount}
  />;
}

/* ─── Inner — tách ra để guard ở trên không vi phạm rules of hooks ── */
function Inner({ eyebrow, title, tabs, loading, viewAllLink, skeletonCount }) {
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  // 2. Single source — 1 biến duy nhất, không thể lệch
  const activeKey = tabs.some((t) => t.key === activeTab)
    ? activeTab
    : tabs[0].key;
  const current = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  // Sync khi tabs prop thay đổi từ bên ngoài
  const tabSignature = tabs.map((t) => t.key).join("|");
  useEffect(() => {
    const keys = tabSignature.split("|");
    if (!keys.includes(activeTab)) setActiveTab(keys[0]);
  }, [tabSignature]); // bỏ activeTab khỏi deps — chỉ cần chạy khi tabs đổi

  // 3. Fade transition khi đổi tab
  const gridRef    = useRef(null);
  const prevKeyRef = useRef(activeKey);

  useEffect(() => {
    if (prevKeyRef.current === activeKey) return;
    prevKeyRef.current = activeKey;

    const el = gridRef.current;
    if (!el) return;

    // Preflight: check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Fade out → đổi content (đã đổi qua state) → fade in
    el.style.transition = "none";
    el.style.opacity    = "0";
    el.style.transform  = "translateY(6px)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "opacity 220ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1)";
        el.style.opacity    = "1";
        el.style.transform  = "translateY(0)";
      });
    });
  }, [activeKey]);

  const headingId = `section-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section className="container-page" aria-labelledby={headingId}>

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2
            id={headingId}
            className="font-display text-3xl font-extrabold tracking-tight"
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Tab switcher */}
          {tabs.length > 1 && (
            <div
              className="flex items-center bg-surface border border-border rounded-xl p-1 gap-0.5"
              role="tablist"
              aria-label={`${title} categories`}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  id={`tab-${tab.key}`}
                  aria-selected={activeKey === tab.key}
                  aria-controls={`tabpanel-${headingId}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-sm font-semibold font-display",
                    "whitespace-nowrap transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    "focus-visible:outline-[color:var(--color-accent)]",
                    activeKey === tab.key
                      ? "bg-surface3 text-text shadow-sm"
                      : "text-muted hover:text-text2"
                  )}
                >
                  {tab.label}
                  {/* Badge số sản phẩm nếu có */}
                  {tab.count != null && (
                    <span style={{
                      marginLeft:   5,
                      fontSize:     10,
                      fontWeight:   600,
                      padding:      "1px 5px",
                      borderRadius: 99,
                      background:   activeKey === tab.key
                        ? "rgba(255,255,255,0.12)"
                        : "var(--color-surface3)",
                      color: activeKey === tab.key
                        ? "var(--color-text)"
                        : "var(--color-muted)",
                      verticalAlign: "middle",
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* View all */}
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-sm font-semibold text-muted hover:text-accent-hl transition-colors whitespace-nowrap rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
            >
              View all →
            </Link>
          )}
        </div>
      </div>

      {/* 3. Grid với fade transition — ref trên wrapper */}
      <div
        ref={gridRef}
        id={`tabpanel-${headingId}`}
        role="tabpanel"
        aria-labelledby={activeKey ? `tab-${activeKey}` : undefined}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
        style={{ willChange: "opacity, transform" }}
      >
        {loading
          // 4. skeletonCount prop
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : current?.products?.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
        }
      </div>
    </section>
  );
}