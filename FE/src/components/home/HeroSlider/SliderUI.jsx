/**
 * SliderUI.jsx — pure presentational layer, zero state.
 * All animation runs on opacity + transform (GPU-composited).
 * The ONE performance rule: never transition `filter`, `background`,
 * `width`, or `height` — always cross-fade via `opacity`.
 *
 * NEW in this version:
 *  • PriceBadge   — giá + giá gốc + % giảm
 *  • StockBadge   — tình trạng kho (còn hàng / sắp hết / hết hàng)
 *  • RatingStars  — số sao + số review
 *  • useImagePreloader — preload ảnh slide kế tiếp
 */
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EXIT_MS, ENTER_MS, INTERVAL_MS } from "./useSlider";

/* ═══════════════════════════════════════════════════════════
   ANIMATION HELPERS
═══════════════════════════════════════════════════════════ */
const EASE_OUT_SPRING = "cubic-bezier(0.16,1,0.3,1)";
const EASE_PRESS      = "cubic-bezier(0.34,1.56,0.64,1)";

export function phaseStyle(phase, direction, reducedMotion, delayMs = 0) {
  if (reducedMotion) return {};
  const sign  = direction === "next" ? 1 : -1;
  const xExit = `${sign * -10}px`;
  const xEnter= `${sign *  14}px`;

  return {
    opacity:    phase === "exit" ? 0 : 1,
    transform:
      phase === "exit"  ? `translateY(-8px) translateX(${xExit})`
    : phase === "enter" ? `translateY(9px)  translateX(${xEnter})`
    :                     "translateY(0) translateX(0)",
    transition:
      phase === "exit"
        ? `opacity ${EXIT_MS}ms ease-in, transform ${EXIT_MS}ms ease-in`
        : `opacity ${ENTER_MS}ms ${EASE_OUT_SPRING} ${delayMs}ms, transform ${ENTER_MS}ms ${EASE_OUT_SPRING} ${delayMs}ms`,
    willChange: "opacity, transform",
  };
}

/* ═══════════════════════════════════════════════════════════
   useImagePreloader
   Preloads the NEXT slide's image so it's in browser cache
   before the user navigates to it. Zero flicker on transition.

   Why not preload ALL images up front?
   → On mobile, loading 5 hero images at 400–600 KB each
     blocks critical resources. We load one step ahead only.
═══════════════════════════════════════════════════════════ */
export function useImagePreloader(slides, current) {
  useEffect(() => {
    if (!slides?.length) return;
    const nextIndex = (current + 1) % slides.length;
    const src = slides[nextIndex]?.image;
    if (!src) return;
    const img = new Image();
    img.src = src;
    // No cleanup needed — browser cache handles deduplication
  }, [slides, current]);
}

/* ═══════════════════════════════════════════════════════════
   BgLayer — GPU opacity cross-fade of gradient backgrounds.
═══════════════════════════════════════════════════════════ */
export function BgLayer({ slide, isActive, reducedMotion }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)`,
        opacity:    isActive ? 1 : 0,
        transition: reducedMotion ? "none" : `opacity ${ENTER_MS}ms ease`,
        willChange: "opacity",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   AmbientOrb — decorative glow, cheap via scale() trick.
═══════════════════════════════════════════════════════════ */
const ORB_ORIGINS = ["top-right", "top-left", "top-right", "top-left"];

export function AmbientOrb({ slide, slideIndex, isActive, reducedMotion }) {
  const origin  = ORB_ORIGINS[slideIndex % ORB_ORIGINS.length];
  const isRight = origin === "top-right";

  return (
    <div
      aria-hidden
      className="absolute pointer-events-none z-[1]"
      style={{
        width:  200,
        height: 200,
        borderRadius: "50%",
        background: slide.accentColor,
        filter: "blur(28px)",
        transform: "scale(3.5)",
        transformOrigin: `${isRight ? "right" : "left"} top`,
        top:   isRight ? -80 : -60,
        right: isRight ? -60 : "auto",
        left:  isRight ? "auto" : -60,
        opacity:    isActive ? 0.18 : 0,
        transition: reducedMotion ? "none" : `opacity ${ENTER_MS}ms ease`,
        willChange: "opacity",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   NavBtn — glass pill with physics micro-interaction.
═══════════════════════════════════════════════════════════ */
export function NavBtn({ onClick, ariaLabel, dir, accentColor }) {
  const ref = useRef(null);

  const states = {
    idle: {
      transform:  "translateY(-50%) scale(1)",
      background: "rgba(255,255,255,0.07)",
      borderColor:"rgba(255,255,255,0.13)",
      color:      "rgba(255,255,255,0.65)",
      boxShadow:  "inset 0 1px 0 rgba(255,255,255,0.09), 0 2px 14px rgba(0,0,0,0.30)",
    },
    hover: {
      transform:  "translateY(-50%) scale(1.09)",
      background: "rgba(255,255,255,0.14)",
      borderColor:"rgba(255,255,255,0.26)",
      color:      "#fff",
      boxShadow:  `inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 22px rgba(0,0,0,0.40), 0 0 20px ${accentColor}28`,
    },
    press: {
      transform:  "translateY(-50%) scale(0.93)",
      background: "rgba(255,255,255,0.10)",
      borderColor:"rgba(255,255,255,0.18)",
      color:      "#fff",
      boxShadow:  "inset 0 2px 6px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.24)",
    },
  };

  const set = (s) => { if (ref.current) Object.assign(ref.current.style, states[s]); };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => set("hover")}
      onMouseLeave={() => set("idle")}
      onMouseDown={() => set("press")}
      onMouseUp={() => set("hover")}
      className="absolute top-1/2 z-20 flex items-center justify-center rounded-full md:opacity-0 md:group-hover:opacity-100 opacity-90 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)]"
      style={{
        [dir === "left" ? "left" : "right"]: "1.5rem",
        width:  56, height: 56,
        border: "1px solid rgba(255,255,255,0.13)",
        backdropFilter:       "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        cursor:     "pointer",
        transition: `transform 155ms ${EASE_PRESS}, background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, color 140ms ease, opacity 200ms ease`,
        willChange: "transform, opacity",
        ...states.idle,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {dir === "left"
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   Indicators — pill dots
═══════════════════════════════════════════════════════════ */
export function Indicators({ slides, current, accentColor, onGoTo }) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20"
      role="group" aria-label="Slide indicators">
      {slides.map((_, i) => {
        const active = i === current;
        return (
          <button key={i} type="button"
            aria-current={active ? "true" : undefined}
            aria-label={`Slide ${i + 1} of ${slides.length}`}
            onClick={() => onGoTo(i)}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            style={{
              padding: 0, border: "none", background: "none", cursor: "pointer",
              width: active ? 38 : 26, height: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "width 300ms cubic-bezier(0.34,1.56,0.64,1)",
            }}>
            <span style={{
              display: "block",
              width:   active ? 34 : 7,
              height:  7,
              borderRadius: 99,
              background: active ? accentColor : "rgba(255,255,255,0.28)",
              boxShadow:  active ? `0 0 10px ${accentColor}88` : "none",
              transition: "width 300ms cubic-bezier(0.34,1.56,0.64,1), background 260ms ease, box-shadow 260ms ease",
            }} />
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ProgressBar — direct DOM mutation, zero re-render on hover.
═══════════════════════════════════════════════════════════ */
export function ProgressBar({ accentColor, slideKey, barRef, reducedMotion }) {
  if (reducedMotion) return null;
  return (
    <div aria-hidden className="absolute bottom-0 left-0 right-0 z-20"
      style={{ height: 2, background: "rgba(255,255,255,0.055)" }}>
      <div
        key={slideKey}
        ref={barRef}
        style={{
          height:             "100%",
          borderRadius:       "0 2px 2px 0",
          background:         `linear-gradient(90deg, ${accentColor}99, ${accentColor})`,
          boxShadow:          `0 0 8px ${accentColor}55`,
          animation:          `progress ${INTERVAL_MS}ms linear forwards`,
          animationPlayState: "running",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SlideImage — skeleton → reveal on load
═══════════════════════════════════════════════════════════ */
export function SlideImage({ src, alt, accentColor }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); }, [src]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: "clamp(210px,37vw,420px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 32px 72px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)",
      }}>
      <div aria-hidden className="skeleton absolute inset-0"
        style={{ opacity: loaded ? 0 : 1, transition: "opacity 280ms ease" }} />
      <img key={src} src={src} alt={alt} draggable={false}
        onLoad={() => setLoaded(true)}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 340ms ease",
        }} />
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}48, transparent)` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NEW — PriceBadge
   Hiển thị: giá hiện tại + giá gốc bị gạch + % giảm giá.

   Slide data cần có:
     price         : string  — "12.990.000₫"
     originalPrice : string  — "15.990.000₫"  (optional)
     discountPct   : number  — 19  (optional, auto-calc nếu không có)

   Nếu không có originalPrice thì chỉ hiện giá hiện tại.
═══════════════════════════════════════════════════════════ */
export function PriceBadge({ slide, reducedMotion }) {
  const { price, originalPrice, discountPct, accentColor } = slide;
  if (!price) return null;

  return (
    <div
      className="inline-flex items-center gap-3 flex-wrap"
      style={{
        opacity:    1,
        animation:  reducedMotion ? "none" : "slideUp 500ms cubic-bezier(0.16,1,0.3,1) 120ms both",
      }}
    >
      {/* Giá hiện tại */}
      <span style={{
        fontFamily:  "var(--font-display)",
        fontWeight:  800,
        fontSize:    "clamp(20px,2.4vw,28px)",
        color:       accentColor,
        letterSpacing: "-0.02em",
        textShadow:  `0 0 24px ${accentColor}55`,
      }}>
        {price}
      </span>

      {/* Giá gốc + badge giảm giá */}
      {originalPrice && (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize:   14,
            color:      "rgba(255,255,255,0.38)",
            textDecoration: "line-through",
          }}>
            {originalPrice}
          </span>

          {discountPct && (
            <span style={{
              fontFamily:  "var(--font-display)",
              fontWeight:  700,
              fontSize:    12,
              padding:     "3px 8px",
              borderRadius: 99,
              background:  "#ef4444",
              color:       "#fff",
              letterSpacing: "0.02em",
            }}>
              -{discountPct}%
            </span>
          )}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NEW — StockBadge
   Tình trạng kho hàng với màu sắc tương ứng.

   Slide data cần có:
     stock : "in_stock" | "low_stock" | "out_of_stock"
     stockLabel : string — "Còn hàng" / "Chỉ còn 3 sản phẩm" / "Hết hàng"

   stockLabel là optional; component có default fallback.
═══════════════════════════════════════════════════════════ */
const STOCK_CONFIG = {
  in_stock:     { color: "#22c55e", dot: "#16a34a", label: "Còn hàng"          },
  low_stock:    { color: "#f59e0b", dot: "#d97706", label: "Sắp hết hàng"      },
  out_of_stock: { color: "#ef4444", dot: "#dc2626", label: "Tạm hết hàng"      },
};

export function StockBadge({ slide }) {
  const { stock, stockLabel } = slide;
  if (!stock || stock === "in_stock") return null; // Không cần badge nếu bình thường còn hàng

  const cfg = STOCK_CONFIG[stock] ?? STOCK_CONFIG.in_stock;
  const text = stockLabel ?? cfg.label;

  return (
    <span style={{
      display:        "inline-flex",
      alignItems:     "center",
      gap:            6,
      fontFamily:     "var(--font-body)",
      fontWeight:     500,
      fontSize:       12,
      padding:        "4px 10px",
      borderRadius:   99,
      border:         `1px solid ${cfg.color}40`,
      background:     `${cfg.color}14`,
      color:          cfg.color,
    }}>
      {/* Animated pulse dot */}
      <span style={{ position: "relative", display: "inline-block", width: 7, height: 7 }}>
        <span style={{
          position:     "absolute",
          inset:        0,
          borderRadius: "50%",
          background:   cfg.dot,
          animation:    stock === "low_stock" ? "ping 1.4s ease-out infinite" : "none",
          opacity:      0.6,
        }} />
        <span style={{
          position:     "absolute",
          inset:        "1px",
          borderRadius: "50%",
          background:   cfg.color,
        }} />
      </span>
      {text}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   NEW — RatingStars
   Số sao + số lượt đánh giá.

   Slide data cần có:
     rating      : number  — 4.7
     reviewCount : number  — 1240

   Render 5 SVG stars, filled proportionally theo rating.
   Dùng clipPath để star được fill một phần (4.7 / 5 = 94%).
═══════════════════════════════════════════════════════════ */
export function RatingStars({ slide }) {
  const { rating, reviewCount } = slide;
  if (!rating) return null;

  const pct = Math.min(Math.max(rating / 5, 0), 1) * 100;
  const id  = `star-clip-${Math.round(rating * 10)}`;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {/* Star track */}
      <svg width="88" height="16" viewBox="0 0 88 16" aria-hidden>
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width={`${pct}%`} height="16" />
          </clipPath>
        </defs>
        {/* Empty stars (base layer) */}
        {[0,1,2,3,4].map(i => (
          <StarPath key={i} x={i * 18} fill="rgba(255,255,255,0.18)" />
        ))}
        {/* Filled stars (clipped) */}
        <g clipPath={`url(#${id})`}>
          {[0,1,2,3,4].map(i => (
            <StarPath key={i} x={i * 18} fill="#fbbf24" />
          ))}
        </g>
      </svg>

      <span style={{
        fontFamily: "var(--font-body)",
        fontSize:   13,
        fontWeight: 600,
        color:      "#fbbf24",
        letterSpacing: "0.01em",
      }}>
        {rating.toFixed(1)}
      </span>

      {reviewCount && (
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize:   12,
          color:      "rgba(255,255,255,0.38)",
        }}>
          ({reviewCount.toLocaleString("vi-VN")} đánh giá)
        </span>
      )}
    </div>
  );
}

// Micro helper — star path at offset x
function StarPath({ x, fill }) {
  return (
    <path
      transform={`translate(${x}, 0)`}
      d="M8 1l1.854 3.755L14 5.28l-3 2.924.708 4.127L8 10.25l-3.708 2.08L5 8.204 2 5.28l4.146-.525z"
      fill={fill}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   PrimaryBtn & SecondaryBtn — CTA links với physics states.
═══════════════════════════════════════════════════════════ */
export function PrimaryBtn({ slide }) {
  const ref = useRef(null);
  const ac  = slide.accentColor;
  const sh  = (lift) =>
    `inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.14), 0 ${lift}px 0 rgba(0,0,0,0.20), 0 ${lift*3+4}px ${lift*6+14}px ${ac}${lift>1?"77":"55"}`;

  const set = (transform, boxShadow, filter) => {
    const el = ref.current; if (!el) return;
    Object.assign(el.style, { transform, boxShadow, filter });
  };

  return (
    <Link ref={ref} to={slide.ctaLink}
      onMouseEnter={() => set("translateY(-2px) scale(1.025)", sh(3), "brightness(1.10)")}
      onMouseLeave={() => set("translateY(0) scale(1)", sh(1), "brightness(1)")}
      onMouseDown={() => set("translateY(1px) scale(0.975)", `inset 0 2px 5px rgba(0,0,0,0.26), 0 1px 3px ${ac}33`, "brightness(0.94)")}
      onMouseUp={() => set("translateY(-2px) scale(1.025)", sh(3), "brightness(1.10)")}
      className="group/cta relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl font-display font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
      style={{
        fontSize: 15, padding: "15px 30px",
        background: `linear-gradient(170deg, ${ac}dd 0%, ${ac} 52%, ${ac}bb 100%)`,
        boxShadow: sh(1), transform: "translateY(0) scale(1)", filter: "brightness(1)",
        textShadow: "0 1px 2px rgba(0,0,0,0.18)",
        transition: `transform 160ms ${EASE_PRESS}, box-shadow 160ms ease, filter 160ms ease`,
        willChange: "transform", cursor: "pointer",
      }}>
      <span aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background:     "linear-gradient(108deg,transparent 28%,rgba(255,255,255,0.18) 50%,transparent 72%)",
        backgroundSize: "200% 100%",
        animation:      "shimmer 3.2s ease-in-out infinite",
      }} />
      <span className="relative z-10">{slide.cta}</span>
      <svg className="relative z-10 transition-transform duration-200 group-hover/cta:translate-x-1"
        width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export function SecondaryBtn({ slide }) {
  const ref = useRef(null);
  const set = (color, bg, border) => {
    const el = ref.current; if (!el) return;
    Object.assign(el.style, { color, background: bg, borderColor: border });
  };
  return (
    <Link ref={ref} to={slide.secondaryLink}
      onMouseEnter={() => set("var(--color-text)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.18)")}
      onMouseLeave={() => set("var(--color-muted)", "transparent", "rgba(255,255,255,0.10)")}
      className="group/sec inline-flex items-center gap-2 rounded-xl font-display font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
      style={{
        fontSize: 15, padding: "15px 22px",
        color: "var(--color-muted)", background: "transparent",
        border: "1px solid rgba(255,255,255,0.10)",
        transition: "color 140ms ease, background 140ms ease, border-color 140ms ease",
        cursor: "pointer",
      }}>
      {slide.secondaryCta}
      <svg className="transition-transform duration-200 group-hover/sec:translate-x-0.5"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}