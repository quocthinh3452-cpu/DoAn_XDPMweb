/**
 * DealsBanner.jsx — v2
 *
 * Fixes:
 *  1. endTime prop (ISO string) — countdown không reset khi F5
 *  2. Countdown tách riêng — chỉ nó re-render mỗi giây, không phải toàn banner
 *  3. visibilitychange — pause interval khi tab ẩn
 *  4. products prop — ảnh sản phẩm thật thay Unsplash generic
 *  5. endTime hardcode → prop từ CMS/API
 *
 * UI/UX improvements:
 *  - Digit flip animation khi số thay đổi (CSS keyframe, GPU only)
 *  - Progress bar phía trên banner — visual urgency không cần đọc số
 *  - Deal tags trên mỗi ảnh sản phẩm — "-20%", "-15%"
 *  - "X người đang xem" social proof — tăng urgency
 *  - Badge ⚡ Flash Sale bắt mắt hơn với pulse animation
 *  - CTA "Shop the Sale" nổi bật hơn, secondary button rõ ràng hơn
 *
 * Props:
 *  endTime   : string  — ISO 8601, vd "2026-03-25T23:59:59+07:00"
 *  title     : string  — "Up to 20% Off\non Top Brands"
 *  subtitle  : string  — "Limited time. Selected smartphones..."
 *  ctaLabel  : string  — "Shop the Sale"
 *  ctaLink   : string  — "/products?sort=price_asc"
 *  products  : Array<{ image, alt, discount }>  — max 3
 *  viewers   : number  — "X người đang xem" (optional)
 */
import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";

function pad2(n) { return String(n).padStart(2, "0"); }

function getRemaining(endTime) {
  return Math.max(0, Math.floor((new Date(endTime) - Date.now()) / 1000));
}

/* ═══════════════════════════════════════════════════════════
   Countdown — isolated component
   Only this re-renders every second. Banner stays static.
   FIX 2 + FIX 3
═══════════════════════════════════════════════════════════ */
const Countdown = memo(function Countdown({ endTime }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endTime));
  // Track prev digits for flip animation
  const prevRef = useRef({});

  // FIX 3: pause when tab hidden
  useEffect(() => {
    let t = null;

    const tick = () => {
      setRemaining(getRemaining(endTime));
    };

    const start = () => {
      t = window.setInterval(tick, 1000);
    };
    const stop = () => {
      if (t) { window.clearInterval(t); t = null; }
    };

    const onVisibility = () => document.hidden ? stop() : start();

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [endTime]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const units = [
    { val: pad2(h), label: "GIỜ"  },
    { val: pad2(m), label: "PHÚT" },
    { val: pad2(s), label: "GIÂY" },
  ];

  // Progress: what fraction of original duration is left
  // Approximate total = distance from now to endTime at mount
  // We store this in a ref so it doesn't re-init on each render
  const totalRef = useRef(null);
  if (totalRef.current === null) totalRef.current = getRemaining(endTime);
  const pct = totalRef.current > 0
    ? Math.max(0, Math.min(100, (remaining / totalRef.current) * 100))
    : 0;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Urgency progress bar */}
      <div className="w-full max-w-[260px]">
        <div className="flex justify-between items-center mb-1.5">
          <span style={{
            fontFamily:    "var(--font-display)",
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: "0.1em",
            color:         "var(--color-muted)",
            textTransform: "uppercase",
          }}>
            Kết thúc trong
          </span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize:   10,
            fontWeight: 700,
            color:      pct < 25 ? "var(--color-accent2)" : "var(--color-muted)",
          }}>
            {pct < 25 ? "⚠ Sắp hết!" : `${Math.round(pct)}% còn lại`}
          </span>
        </div>
        <div style={{
          height:       4,
          borderRadius: 99,
          background:   "rgba(255,255,255,0.08)",
          overflow:     "hidden",
        }}>
          <div style={{
            height:       "100%",
            width:        `${pct}%`,
            borderRadius: 99,
            background:   pct < 25
              ? "linear-gradient(90deg, var(--color-accent2), #ff6b6b)"
              : "linear-gradient(90deg, var(--color-accent), var(--color-accent2))",
            transition:   "width 1s linear, background 1s ease",
          }} />
        </div>
      </div>

      {/* Digit tiles */}
      <div
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Còn ${h} giờ ${m} phút ${s} giây`}
        className="flex items-end gap-1"
      >
        {units.map(({ val, label }, i) => {
          // Detect change for flip animation
          const prevVal = prevRef.current[label];
          const changed = prevVal !== undefined && prevVal !== val;
          prevRef.current[label] = val;

          return (
            <div key={label} className="flex items-end">
              <div className="flex flex-col items-center gap-1.5">
                {/* Digit tile */}
                <div
                  key={changed ? `${label}-${val}` : label}
                  style={{
                    width:          72,
                    height:         72,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    borderRadius:   14,
                    background:     "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
                    border:         "1px solid rgba(255,255,255,0.10)",
                    boxShadow:      "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
                    fontFamily:     "var(--font-display)",
                    fontWeight:     800,
                    fontSize:       32,
                    color:          "var(--color-text)",
                    letterSpacing:  "-0.03em",
                    fontVariantNumeric: "tabular-nums",
                    // Flip animation khi digit thay đổi
                    animation:      changed ? "digitFlip 280ms cubic-bezier(0.16,1,0.3,1)" : "none",
                  }}
                >
                  {val}
                </div>
                <span style={{
                  fontFamily:    "var(--font-display)",
                  fontSize:      9,
                  fontWeight:    700,
                  letterSpacing: "0.12em",
                  color:         "var(--color-muted)",
                  textTransform: "uppercase",
                }}>
                  {label}
                </span>
              </div>
              {/* Colon separator */}
              {i < 2 && (
                <span
                  aria-hidden
                  style={{
                    fontFamily:  "var(--font-display)",
                    fontWeight:  800,
                    fontSize:    28,
                    color:       "var(--color-accent)",
                    opacity:     0.7,
                    paddingBottom: 20,
                    margin:      "0 2px",
                    // Pulse colon every second
                    animation:   "colonPulse 1s ease-in-out infinite",
                  }}
                >
                  :
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════
   ProductThumb — sale product image with discount badge
═══════════════════════════════════════════════════════════ */
function ProductThumb({ image, alt, discount, rotate, translateY, delay }) {
  return (
    <div
      style={{
        position:  "relative",
        transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
        animation: `float${delay === 0 ? "A" : "B"} 4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        flexShrink: 0,
      }}
    >
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          width:        96,
          height:       96,
          objectFit:    "cover",
          borderRadius: 16,
          border:       "1px solid rgba(255,255,255,0.10)",
          boxShadow:    "0 12px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
          display:      "block",
        }}
      />
      {/* Discount badge */}
      {discount && (
        <span style={{
          position:    "absolute",
          top:         -8,
          right:       -8,
          fontFamily:  "var(--font-display)",
          fontWeight:  800,
          fontSize:    11,
          padding:     "3px 7px",
          borderRadius: 99,
          background:  "var(--color-accent2, #ff6b6b)",
          color:       "#fff",
          boxShadow:   "0 2px 8px rgba(0,0,0,0.3)",
          letterSpacing: "-0.01em",
          lineHeight:  1,
        }}>
          {discount}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DealsBanner
═══════════════════════════════════════════════════════════ */
export default function DealsBanner({
  // FIX 1: endTime là ISO string cố định từ server/CMS
  // Dù F5 bao nhiêu lần, timer vẫn đếm đúng về cùng 1 điểm
  endTime  = new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // fallback 4h từ lúc build

  title    = "Giảm đến 20%\ncác thương hiệu hàng đầu",
  subtitle = "Thời gian có hạn. Áp dụng cho smartphone, audio & phụ kiện được chọn.",
  ctaLabel = "Mua ngay",
  ctaLink  = "/products?sort=discount_desc",

  // FIX 4: ảnh sản phẩm thật — truyền từ ngoài
  products = [
    { image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&q=80", alt: "iPhone 16 Pro", discount: "-20%" },
    { image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&q=80",    alt: "Samsung Watch", discount: "-15%" },
    { image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80", alt: "Sony WH-1000XM5",discount: "-18%" },
  ],

  viewers = 128, // "X người đang xem" — social proof
}) {
  const titleLines = title.split("\n");

  return (
    <>
      {/* Keyframes — injected once */}
      <style>{`
        @keyframes digitFlip {
          0%   { transform: translateY(-6px) scale(0.96); opacity: 0.4; }
          100% { transform: translateY(0)    scale(1);    opacity: 1;   }
        }
        @keyframes colonPulse {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 0.2; }
        }
        @keyframes floatA {
          0%,100% { transform: rotate(-4deg) translateY(-6px); }
          50%     { transform: rotate(-4deg) translateY(4px);  }
        }
        @keyframes floatB {
          0%,100% { transform: rotate(3deg) translateY(4px);  }
          50%     { transform: rotate(3deg) translateY(-6px); }
        }
        @keyframes flashBadge {
          0%,100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb, 139,92,246), 0.4); }
          50%     { box-shadow: 0 0 0 6px rgba(var(--accent-rgb, 139,92,246), 0);  }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; }
        }
      `}</style>

      <section
        className="container-page section-inset"
        aria-labelledby="deals-banner-heading"
      >
        <div
          className="panel-spotlight relative grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-12 px-6 py-10 md:px-12 md:py-12 overflow-hidden"
        >
          {/* Ambient glows — static, không re-render */}
          <div aria-hidden className="absolute w-[400px] h-[400px] rounded-full -top-[150px] -left-[100px] bg-accent/12 blur-[80px] pointer-events-none z-0" />
          <div aria-hidden className="absolute w-[300px] h-[300px] rounded-full -bottom-[100px] right-[100px] bg-accent2/8 blur-[60px] pointer-events-none z-0" />
          {/* Extra glow — urgency */}
          <div aria-hidden className="absolute w-[200px] h-[200px] rounded-full top-[40%] left-[45%] bg-accent/6 blur-[50px] pointer-events-none z-0" />

          {/* ── Left: copy ─────────────────────────────────── */}
          <div className="relative z-10 flex flex-col gap-5">

            {/* Flash Sale badge — với pulse */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                style={{
                  display:       "inline-flex",
                  alignItems:    "center",
                  gap:           6,
                  fontFamily:    "var(--font-display)",
                  fontWeight:    700,
                  fontSize:      11,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color:         "var(--color-accent)",
                  background:    "var(--color-accent)/12",
                  border:        "1px solid rgba(var(--accent-rgb,139,92,246),0.30)",
                  padding:       "5px 12px 5px 8px",
                  borderRadius:  99,
                  animation:     "flashBadge 2s ease-in-out infinite",
                }}
              >
                {/* Pulse dot */}
                <span style={{
                  width:        7,
                  height:       7,
                  borderRadius: "50%",
                  background:   "var(--color-accent)",
                  display:      "inline-block",
                  flexShrink:   0,
                  animation:    "colonPulse 1s ease-in-out infinite",
                }} aria-hidden />
                Flash Sale
              </span>

              {/* Social proof — viewers */}
              {viewers > 0 && (
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize:   12,
                  color:      "var(--color-muted)",
                  display:    "flex",
                  alignItems: "center",
                  gap:        5,
                }}>
                  <span style={{
                    display:      "inline-block",
                    width:        6,
                    height:       6,
                    borderRadius: "50%",
                    background:   "#22c55e",
                    flexShrink:   0,
                  }} aria-hidden />
                  {viewers.toLocaleString("vi-VN")} người đang xem
                </span>
              )}
            </div>

            {/* Headline */}
            <h2
              id="deals-banner-heading"
              style={{
                fontFamily:    "var(--font-display)",
                fontWeight:    800,
                lineHeight:    1.08,
                letterSpacing: "-0.032em",
                fontSize:      "clamp(28px,3.8vw,42px)",
                color:         "var(--color-text)",
                margin:        0,
              }}
            >
              {titleLines.map((line, i) =>
                i === 0 ? (
                  <span key={i} className="block">
                    {/* Highlight "Giảm đến 20%" */}
                    <span style={{
                      background: "linear-gradient(135deg, var(--color-accent), var(--color-accent2))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {line}
                    </span>
                  </span>
                ) : (
                  <span key={i} className="block">{line}</span>
                )
              )}
            </h2>

            {/* Subtitle */}
            <p style={{
              fontFamily:  "var(--font-body)",
              fontSize:    14,
              lineHeight:  1.7,
              color:       "var(--color-muted)",
              maxWidth:    400,
              margin:      0,
            }}>
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 4 }}>
              <Link
                to={ctaLink}
                className="btn btn-lg btn-primary inline-flex items-center gap-2 font-display font-bold"
              >
                {ctaLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link
                to="/products"
                className="btn btn-md btn-secondary inline-flex items-center gap-2 font-display font-semibold"
              >
                Xem tất cả
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-4" style={{ marginTop: 2 }}>
              {[
                { icon: "🛡", text: "Hàng chính hãng" },
                { icon: "🚚", text: "Giao hàng miễn phí" },
                { icon: "↩", text: "Đổi trả 30 ngày" },
              ].map(({ icon, text }) => (
                <span key={text} style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        5,
                  fontFamily: "var(--font-body)",
                  fontSize:   12,
                  color:      "var(--color-muted)",
                }}>
                  <span style={{ fontSize: 13 }} aria-hidden>{icon}</span>
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: countdown + products ────────────────── */}
          {/* FIX 2: Countdown là component riêng — chỉ nó re-render mỗi giây */}
          <div className="relative z-10 flex flex-col items-center gap-8 order-first md:order-last">
            <Countdown endTime={endTime} />

            {/* Product thumbnails */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
              {products.slice(0, 3).map((p, i) => (
                <ProductThumb
                  key={i}
                  image={p.image}
                  alt={p.alt}
                  discount={p.discount}
                  rotate={i === 0 ? -4 : i === 1 ? 0 : 3}
                  translateY={i === 0 ? -6 : i === 1 ? 6 : 4}
                  delay={i * 0.4}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}