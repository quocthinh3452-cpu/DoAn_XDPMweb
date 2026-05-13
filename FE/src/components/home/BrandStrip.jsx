/**
 * BrandStrip.jsx — v3
 *
 * 8 improvements implemented:
 *  1. Tooltip on hover        — name + SKU + "Xem tất cả →"
 *  2. Dark mode logo fix      — mix-blend-mode per theme
 *  3. Dynamic speed           — calculated from brands.length
 *  4. Pause when tab hidden   — visibilitychange API
 *  5. Touch pause on mobile   — touchstart / touchend
 *  6. Flexible card width     — min/max, not fixed
 *  7. Click tracking          — onBrandClick(brand) prop
 *  8. direction prop          — "left" | "right", RTL-ready
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

/* ── Constants — tune here ─────────────────────────────── */
const CARD_H     = 88;    // card height (px)
const CARD_PAD_X = 24;    // horizontal padding each side (px)
const CARD_MIN_W = 120;   // min card width (px)
const CARD_MAX_W = 180;   // max card width (px)
const CARD_GAP   = 12;    // gap between cards (px)
const PX_PER_SEC = 80;    // marquee scroll speed (px/s) — increase = faster

/* ── Helpers ───────────────────────────────────────────── */
function calcDuration(brandCount) {
  const avgW    = (CARD_MIN_W + CARD_MAX_W) / 2;
  const totalPx = brandCount * (avgW + CARD_GAP);
  return `${Math.max(8, Math.round(totalPx / PX_PER_SEC))}s`;
}

/* ═══════════════════════════════════════════════════════════
   BrandStrip
═══════════════════════════════════════════════════════════ */
export default function BrandStrip({
  brands,
  direction    = "left",   // "left" | "right"
  onBrandClick = null,     // (brand) => void — analytics
}) {
  const trackRef  = useRef(null);
  const sectionRef = useRef(null);
  const pausedRef = useRef(false);

  // 1. Tooltip state — single instance at strip level
  const [tooltip, setTooltip] = useState(null); // { brand, rect } | null

  const isDark = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const setPaused = useCallback((v) => {
    if (reducedMotion.current) return;
    pausedRef.current = v;
    if (trackRef.current)
      trackRef.current.style.animationPlayState = v ? "paused" : "running";
  }, []);

  // 4. Pause when tab hidden
  useEffect(() => {
    const h = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, [setPaused]);

  // 5. Touch pause — on the track element
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const start = () => setPaused(true);
    const end   = () => setPaused(false);
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend",   end,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend",   end);
    };
  }, [setPaused]);

  if (!brands?.length) return null;

  // Duplicate enough sets so the marquee never shows a gap
  const sets  = brands.length < 5 ? 4 : 3;
  const items = Array.from({ length: sets }, () => brands).flat();

  const duration = reducedMotion.current ? "0s" : calcDuration(brands.length);
  const animDir  = direction === "right" ? "reverse" : "normal";

  return (
    <section
      ref={sectionRef}
      aria-label="Đại lý chính hãng được uỷ quyền"
      className="container-page"
      style={{ position: "relative" }}
    >
      <p
        className="text-center font-display font-bold uppercase mb-6"
        style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--color-muted)" }}
      >
        Đại lý chính hãng được uỷ quyền
      </p>

      {/* Edge fade mask */}
      <div
        className="overflow-hidden"
        style={{
          maskImage:       "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
        onMouseLeave={() => {
          setPaused(false);
          setTooltip(null);
        }}
      >
        <div
          ref={trackRef}
          className="flex items-center"
          style={{
            width:              "max-content",
            gap:                `${CARD_GAP}px`,
            animation:          `marquee ${duration} linear infinite`,
            animationDirection: animDir,
            animationPlayState: "running",
          }}
        >
          {items.map((brand, i) => (
            <BrandCard
              key={`${brand.id}-${i}`}
              brand={brand}
              isDark={isDark.current}
              onEnter={(b, rect) => {
                setPaused(true);
                setTooltip({ brand: b, rect });
              }}
              onLeave={() => {
                setPaused(false);
                setTooltip(null);
              }}
              onBrandClick={onBrandClick}
            />
          ))}
        </div>
      </div>

      {/* 1. Tooltip — single instance, rendered here */}
      {tooltip && <BrandTooltip tooltip={tooltip} />}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BrandTooltip
   Positioned fixed relative to hovered card's bounding rect.
   Nudged left/right in useEffect to stay inside viewport.
═══════════════════════════════════════════════════════════ */
function BrandTooltip({ tooltip }) {
  const { brand, rect } = tooltip;
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tw   = el.offsetWidth;
    const cx   = rect.left + rect.width / 2;
    const vw   = window.innerWidth;
    let   left = cx - tw / 2;
    if (left + tw > vw - 16) left = vw - tw - 16;
    if (left < 16) left = 16;
    el.style.left    = `${left}px`;
    el.style.opacity = "1";
    el.style.transform = "translateY(-100%) translateY(-16px)";
  }, [rect]);

  const skuLabel = brand.skuCount
    ? `${brand.skuCount.toLocaleString("vi-VN")} sản phẩm`
    : null;

  return (
    <div
      ref={ref}
      role="tooltip"
      style={{
        position:      "fixed",
        top:           rect.top,
        left:          rect.left + rect.width / 2, // corrected in useEffect
        transform:     "translateY(-100%) translateY(-8px)",
        opacity:       0,
        transition:    "opacity 140ms ease, transform 140ms ease",
        zIndex:        50,
        pointerEvents: "none",
        background:    "var(--color-surface)",
        border:        "1px solid var(--color-border)",
        borderRadius:  12,
        padding:       "10px 14px",
        boxShadow:     "0 8px 24px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        whiteSpace:    "nowrap",
        display:       "flex",
        flexDirection: "column",
        gap:           3,
      }}
    >
      {/* Brand name + verified */}
      <span style={{
        fontFamily:    "var(--font-display)",
        fontWeight:    700,
        fontSize:      13,
        color:         "var(--color-text)",
        letterSpacing: "-0.01em",
        display:       "flex",
        alignItems:    "center",
        gap:           6,
      }}>
        {brand.name}
        {brand.verified && (
          <span style={{
            fontSize:      9,
            fontWeight:    700,
            padding:       "2px 5px",
            borderRadius:  4,
            background:    "var(--color-success-bg, #dcfce7)",
            color:         "var(--color-success, #16a34a)",
            letterSpacing: "0.04em",
          }}>
            ✓ CHÍNH HÃNG
          </span>
        )}
      </span>

      {/* SKU count */}
      {skuLabel && (
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize:   11,
          color:      "var(--color-muted)",
        }}>
          {skuLabel}
        </span>
      )}

      {/* CTA */}
      <span style={{
        fontFamily:  "var(--font-display)",
        fontWeight:  600,
        fontSize:    11,
        color:       "var(--color-accent)",
        marginTop:   2,
      }}>
        Xem tất cả →
      </span>

      {/* Down arrow */}
      <span aria-hidden style={{
        position:   "absolute",
        bottom:     -6,
        left:       "50%",
        transform:  "translateX(-50%) rotate(45deg)",
        width:      10,
        height:     10,
        background: "var(--color-surface)",
        border:     "1px solid var(--color-border)",
        borderTop:  "none",
        borderLeft: "none",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BrandCard
   2. mix-blend-mode fix for dark/light logo backgrounds
   6. Flexible width via min/maxWidth
   7. onBrandClick prop
═══════════════════════════════════════════════════════════ */
function BrandCard({ brand, isDark, onEnter, onLeave, onBrandClick }) {
  const cardRef = useRef(null);
  const imgRef  = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  // 2. Dark mode blend mode
  // light bg logo → multiply blends away white background
  // dark bg logo  → screen blends away black background
  const blendMode = isDark ? "screen" : "multiply";

  const applyHover = useCallback((hovered) => {
    const card = cardRef.current;
    const img  = imgRef.current;
    if (!card) return;

    card.style.borderColor = hovered ? "var(--color-accent)" : "var(--color-border)";
    card.style.transform   = hovered ? "translateY(-3px)"    : "translateY(0)";
    card.style.boxShadow   = hovered
      ? "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)"
      : "none";

    if (img) {
      img.style.filter = hovered
        ? "grayscale(0) opacity(1)"
        : "grayscale(0.5) opacity(0.65)";
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    applyHover(true);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) onEnter(brand, rect);
  }, [applyHover, onEnter, brand]);

  const handleMouseLeave = useCallback(() => {
    applyHover(false);
    onLeave();
  }, [applyHover, onLeave]);

  // 7. Click tracking
  const handleClick = useCallback(() => {
    onBrandClick?.(brand);
  }, [onBrandClick, brand]);

  return (
    <Link
      ref={cardRef}
      to={`/products?brand=${encodeURIComponent(brand.name)}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      draggable={false}
      aria-label={`${brand.name}${brand.skuCount ? ` — ${brand.skuCount.toLocaleString("vi-VN")} sản phẩm` : ""}`}
      className="relative flex items-center justify-center shrink-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
      style={{
        // 6. Flexible width
        minWidth:   CARD_MIN_W,
        maxWidth:   CARD_MAX_W,
        width:      "fit-content",
        height:     CARD_H,
        padding:    `14px ${CARD_PAD_X}px`,
        background: "var(--color-surface)",
        border:     "1px solid var(--color-border)",
        transition: "border-color 200ms ease, transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease",
        willChange: "transform",
        overflow:   "hidden",
      }}
    >
      {/* Skeleton shimmer */}
      {!loaded && !error && (
        <div
          aria-hidden
          className="skeleton absolute inset-0"
          style={{ borderRadius: "inherit" }}
        />
      )}

      {/* Error fallback — brand name as text */}
      {error ? (
        <span
          className="font-display font-bold"
          style={{ fontSize: 14, color: "var(--color-muted)", letterSpacing: "-0.01em" }}
        >
          {brand.name}
        </span>
      ) : (
        <img
          ref={imgRef}
          src={brand.logoUrl}
          alt={brand.name}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          style={{
            maxWidth:    "100%",
            maxHeight:   56,
            width:       "auto",
            height:      "auto",
            objectFit:   "contain",
            display:     "block",
            // 2. blend mode removes white/black logo backgrounds
            mixBlendMode: blendMode,
            filter:      "grayscale(0.5) opacity(0.65)",
            opacity:     loaded ? 1 : 0,
            transition:  "filter 220ms ease, opacity 300ms ease",
          }}
        />
      )}
    </Link>
  );
}