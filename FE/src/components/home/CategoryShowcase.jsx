/**
 * CategoryShowcase.jsx
 *
 * Fixes applied:
 *  1. categories prop  — data driven từ ngoài vào, không hardcode
 *  2. productCount     — số SP thật thay vì marketing text
 *  3. loading="lazy"   — 5 ảnh không load cùng lúc
 *  4. scale on wrapper — tránh repaint, dùng will-change: transform
 *  5. SVG icons        — thay emoji, render nhất quán mọi platform
 */
import { Link } from "react-router-dom";

/* ── SVG icon map ───────────────────────────────────────────
   Thêm id mới vào đây khi có category mới.
   Dùng currentColor → tự nhận accent color từ parent.
──────────────────────────────────────────────────────────── */
const ICONS = {
  smartphone: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  laptop: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="13" rx="2"/>
      <path d="M0 21h24"/>
    </svg>
  ),
  audio: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  ),
  tablet: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  wearable: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="3"/>
      <path d="M9 2h6M9 22h6"/>
      <path d="M12 9v3l1.5 1.5"/>
    </svg>
  ),
};

/* ── Default fallback data ──────────────────────────────────
   Dùng khi categories prop không được truyền vào.
   Trong production: fetch từ API, truyền vào qua prop.
──────────────────────────────────────────────────────────── */
const DEFAULT_CATEGORIES = [
  {
    id:           "smartphone",
    label:        "Smartphones",
    productCount: 0,                  // 0 → không hiện count
    gradient:     "linear-gradient(135deg,#1a1040,#0d0d20)",
    accent:       "var(--color-accent)",
    image:        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=75",
  },
  {
    id:           "laptop",
    label:        "Laptops",
    productCount: 0,
    gradient:     "linear-gradient(135deg,#0d1a10,#0a0f0d)",
    accent:       "var(--color-green)",
    image:        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=75",
  },
  {
    id:           "audio",
    label:        "Audio",
    productCount: 0,
    gradient:     "linear-gradient(135deg,#1a0d10,#110a0d)",
    accent:       "var(--color-accent2)",
    image:        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=75",
  },
  {
    id:           "tablet",
    label:        "Tablets",
    productCount: 0,
    gradient:     "linear-gradient(135deg,#0d0f1a,#0a0d14)",
    accent:       "var(--color-blue)",
    image:        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=75",
  },
  {
    id:           "wearable",
    label:        "Wearables",
    productCount: 0,
    gradient:     "linear-gradient(135deg,#1a100d,#12090a)",
    accent:       "var(--color-yellow)",
    image:        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=75",
  },
];

/* ═══════════════════════════════════════════════════════════
   CategoryShowcase
   @param categories  — array từ API/CMS. Default: fallback data.
   @param title       — section heading. Default: "Category"
   @param eyebrow     — small label above heading. Default: "Browse by"
═══════════════════════════════════════════════════════════ */
export default function CategoryShowcase({
  categories = DEFAULT_CATEGORIES,
  title      = "Category",
  eyebrow    = "Browse by",
}) {
  // Lấy đúng 5 cats — không ít hơn (grid vỡ), không nhiều hơn (thiết kế 1+4)
  const cats = categories.slice(0, 5);

  if (!cats.length) return null;

  return (
    <section className="container-page">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">{title}</h2>
        </div>
        <Link
          to="/products"
          className="text-sm font-semibold text-muted hover:text-accent-hl transition-colors whitespace-nowrap rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
        >
          See all →
        </Link>
      </div>

      {/* Grid: 1 large left + 2×2 right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Large feature card — first category */}
        <CatCard
          cat={cats[0]}
          className="min-h-[220px] md:min-h-[420px]"
          large
          // 3. Đầu tiên trong viewport → không lazy load
          eager
        />

        {/* 2×2 small cards */}
        <div className="grid grid-cols-2 gap-3">
          {cats.slice(1).map((cat) => (
            <CatCard
              key={cat.id}
              cat={cat}
              className="min-h-[180px] md:min-h-[200px]"
            />
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─── CatCard ───────────────────────────────────────────────
   eager prop  — large card above fold không cần lazy load
   FIX 4: scale đặt trên wrapper div, không phải trên <img>
           → transform GPU-composited, không trigger layout
   FIX 5: SVG icon thay emoji
──────────────────────────────────────────────────────────── */
function CatCard({ cat, className = "", large = false, eager = false }) {
  // 2. Format số sản phẩm — "1.240 sản phẩm" hoặc null nếu chưa có data
  const countLabel = cat.productCount > 0
    ? `${cat.productCount.toLocaleString("vi-VN")} sản phẩm`
    : cat.subtitle ?? null; // fallback về subtitle nếu có

  return (
    <Link
      to={`/products?category=${cat.id}`}
      className={`relative rounded-2xl overflow-hidden border border-white/5 group
        hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.6)]
        transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[color:var(--color-accent)]/55
        focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]
        ${className}`}
      style={{ background: cat.gradient }}
    >
      {/* BG image — FIX 4: scale trên wrapper, không phải img */}
      <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500 will-change-transform">
        <img
          src={cat.image}
          alt=""                          // decorative — label ở dưới đã đủ
          aria-hidden
          // FIX 3: lazy load mọi card trừ card đầu tiên (eager prop)
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
        />
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Accent glow */}
      <div
        className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{ background: cat.accent }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center gap-3 z-10">

        {/* FIX 5: SVG icon — fallback về first letter nếu không có icon */}
        <span
          className="shrink-0 flex items-center justify-center"
          style={{ color: cat.accent, width: 22, height: 22 }}
          aria-hidden
        >
          {ICONS[cat.id] ?? (
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize:   18,
              lineHeight: 1,
            }}>
              {cat.label[0]}
            </span>
          )}
        </span>

        <div className="flex-1 min-w-0">
          <p className={`font-display font-bold text-text leading-tight ${large ? "text-xl" : "text-base"}`}>
            {cat.label}
          </p>

          {/* 2. Số sản phẩm thật — ẩn nếu chưa có */}
          {countLabel && (
            <p className="text-xs text-white/50 mt-0.5">{countLabel}</p>
          )}
        </div>

        {/* Arrow — chỉ hiện khi hover */}
        <span
          className="text-lg font-bold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0"
          style={{ color: cat.accent }}
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}