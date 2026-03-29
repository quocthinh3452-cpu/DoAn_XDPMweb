/**
 * WhyUs.jsx — v2
 *
 * Giữ nguyên: prop interface { items }, grid layout, hover state
 *
 * Cải thiện:
 *  1. SVG icons thay emoji — nhất quán cross-platform, nhận accent color
 *  2. Visual weight cao hơn — card lớn hơn, icon container nổi bật
 *  3. stat (số liệu) optional per item — "50.000+ đơn hàng", "4.9★"
 *  4. Animated count-up khi card vào viewport — IntersectionObserver
 *  5. Separator line giữa các card thay vì gap 1px — tinh tế hơn
 *  6. Accent color per item — mỗi card có màu riêng, không đồng nhất
 *
 * Item shape (mở rộng, backward compatible):
 * {
 *   icon    : string   — tên icon: "shield" | "truck" | "refresh" | "star" | "phone" | "lock"
 *   title   : string
 *   desc    : string
 *   stat?   : string   — "50.000+" — số liệu nổi bật (optional)
 *   statLabel?: string — "đơn hàng" — label dưới số (optional)
 *   accent? : string   — CSS color, default dùng --color-accent
 * }
 */
import { useEffect, useRef } from "react";

/* ── SVG icon map ───────────────────────────────────────── */
const ICONS = {
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  truck: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 5v3h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  refresh: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  ),
  star: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  phone: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/>
    </svg>
  ),
  lock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  tag: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
};

/* ── Default accent colors per position ─────────────────── */
const DEFAULT_ACCENTS = [
  "var(--color-accent)",
  "var(--color-green,  #22c55e)",
  "var(--color-blue,   #3b82f6)",
  "var(--color-yellow, #f59e0b)",
];

/* ── DEFAULT ITEMS — fallback khi không truyền prop ─────── */
const DEFAULT_ITEMS = [
  {
    icon:      "shield",
    title:     "Hàng chính hãng 100%",
    desc:      "Đại lý uỷ quyền chính thức của Apple, Samsung, Google và nhiều thương hiệu lớn.",
    stat:      "8+",
    statLabel: "thương hiệu",
    accent:    "var(--color-accent)",
  },
  {
    icon:      "truck",
    title:     "Giao hàng miễn phí",
    desc:      "Miễn phí giao hàng toàn quốc cho đơn từ 500.000₫. Giao nhanh 2–4 giờ nội thành.",
    stat:      "2–4h",
    statLabel: "nội thành HCM",
    accent:    "var(--color-green, #22c55e)",
  },
  {
    icon:      "refresh",
    title:     "Đổi trả trong 30 ngày",
    desc:      "Không hài lòng? Đổi trả dễ dàng trong vòng 30 ngày, không cần giải thích.",
    stat:      "30",
    statLabel: "ngày đổi trả",
    accent:    "var(--color-blue, #3b82f6)",
  },
  {
    icon:      "star",
    title:     "Đánh giá 4.9★",
    desc:      "Hơn 50.000 khách hàng hài lòng. Được tin tưởng là shop điện thoại uy tín nhất.",
    stat:      "50K+",
    statLabel: "đánh giá 5 sao",
    accent:    "var(--color-yellow, #f59e0b)",
  },
];

/* ═══════════════════════════════════════════════════════════
   WhyUs
═══════════════════════════════════════════════════════════ */
export default function WhyUs({
  items   = DEFAULT_ITEMS,
  eyebrow = "Tại sao chọn chúng tôi",
  heading = "Mua sắm an tâm",
}) {
  return (
    <section className="container-page pt-8 md:pt-12" aria-labelledby="why-us-heading">

      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2
          id="why-us-heading"
          className="font-display font-extrabold tracking-tight"
          style={{ fontSize: "clamp(24px,3vw,32px)", letterSpacing: "-0.02em" }}
        >
          {heading}
        </h2>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <WhyUsCard
            key={i}
            item={item}
            accent={item.accent ?? DEFAULT_ACCENTS[i % DEFAULT_ACCENTS.length]}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── WhyUsCard ─────────────────────────────────────────────
   Mỗi card có:
   - Icon container với accent color background
   - Title + desc
   - Stat số liệu nổi bật (optional) với count-up animation
──────────────────────────────────────────────────────────── */
function WhyUsCard({ item, accent, index }) {
  const cardRef = useRef(null);
  const statRef = useRef(null);
  const animated = useRef(false);

  const icon = ICONS[item.icon] ?? ICONS["shield"];

  // 4. Count-up khi vào viewport
  useEffect(() => {
    if (!item.stat || !statRef.current) return;

    // Parse số từ stat string, ví dụ "50K+" → 50, "4.9" → 4.9, "30" → 30
    const raw    = item.stat.replace(/[^0-9.]/g, "");
    const target = parseFloat(raw);
    const suffix = item.stat.replace(/[0-9.]/g, ""); // "K+", "★", "h", ""
    if (isNaN(target)) return; // "2–4h" — skip animation, hiện nguyên

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return;
        animated.current = true;

        const duration = 1200;
        const start    = performance.now();
        const isFloat  = raw.includes(".");

        const step = (now) => {
          const p   = Math.min((now - start) / duration, 1);
          // ease out cubic
          const val = target * (1 - Math.pow(1 - p, 3));
          if (statRef.current) {
            statRef.current.textContent = isFloat
              ? val.toFixed(1) + suffix
              : Math.round(val) + suffix;
          }
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      },
      { threshold: 0.4 }
    );

    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, [item.stat]);

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col gap-5 rounded-2xl p-6 bg-surface border border-border
        hover:border-opacity-60 transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
      style={{
        // Subtle accent glow on hover via CSS custom property
        "--card-accent": accent,
      }}
    >
      {/* Hover glow — accent per card */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${accent}10 0%, transparent 60%)`,
        }}
      />

      {/* Top row: icon + stat */}
      <div className="relative flex items-start justify-between gap-3">
        {/* Icon container */}
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{
            width:      48,
            height:     48,
            background: `${accent}18`,
            border:     `1px solid ${accent}30`,
            color:      accent,
            transition: "background 200ms ease, transform 200ms ease",
          }}
        >
          {icon}
        </div>

        {/* Stat — top right, count-up on enter */}
        {item.stat && (
          <div className="text-right shrink-0">
            <p
              ref={statRef}
              style={{
                fontFamily:    "var(--font-display)",
                fontWeight:    800,
                fontSize:      22,
                color:         accent,
                letterSpacing: "-0.03em",
                lineHeight:    1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.stat}
            </p>
            {item.statLabel && (
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize:   10,
                color:      "var(--color-muted)",
                marginTop:  2,
                lineHeight: 1.3,
                maxWidth:   80,
                textAlign:  "right",
              }}>
                {item.statLabel}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="relative flex flex-col gap-1.5">
        <p style={{
          fontFamily:    "var(--font-display)",
          fontWeight:    700,
          fontSize:      14,
          color:         "var(--color-text)",
          letterSpacing: "-0.01em",
          lineHeight:    1.3,
        }}>
          {item.title}
        </p>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize:   13,
          color:      "var(--color-muted)",
          lineHeight: 1.65,
        }}>
          {item.desc}
        </p>
      </div>
    </div>
  );
}