/**
 * ImageGallery.jsx — v2
 *
 * Fixes:
 *  1. Body scroll lock khi lightbox mở
 *  2. "Hover to zoom" hint fix — dùng isHovered state thay group-hover
 *  3. Arrow nav SVG thay ‹ › text
 *  4. Touch swipe — prev/next trên mobile
 *  5. Thumbnail lazy load
 *  6. Fade transition giữa ảnh
 *  7. Lightbox role="dialog" + aria đầy đủ
 *  8. Zoom disable trên touch device
 */
import { useState, useEffect, useCallback, useRef } from "react";

/* ── Touch swipe hook ───────────────────────────────────── */
function useSwipe(ref, onLeft, onRight, minDist = 48) {
  const onLeftRef  = useRef(onLeft);
  const onRightRef = useRef(onRight);
  useEffect(() => { onLeftRef.current  = onLeft;  }, [onLeft]);
  useEffect(() => { onRightRef.current = onRight; }, [onRight]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x0 = null, y0 = null, axis = null;

    const start = (e) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      axis = null;
    };
    const move = (e) => {
      if (x0 === null) return;
      const dx = e.touches[0].clientX - x0;
      const dy = e.touches[0].clientY - y0;
      if (!axis && (Math.abs(dx) > 5 || Math.abs(dy) > 5))
        axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      if (axis === "x") e.preventDefault();
    };
    const end = (e) => {
      if (x0 === null || axis !== "x") { x0 = null; return; }
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) >= minDist) dx < 0 ? onLeftRef.current() : onRightRef.current();
      x0 = null; axis = null;
    };

    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove",  move,  { passive: false });
    el.addEventListener("touchend",   end,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove",  move);
      el.removeEventListener("touchend",   end);
    };
  }, [ref]);
}

/* ── SVG Arrows ─────────────────────────────────────────── */
function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── NavButton ───────────────────────────────────────────── */
function NavButton({ onClick, dir, label }) {
  const ref = useRef(null);
  const set = (hov) => {
    const el = ref.current;
    if (!el) return;
    el.style.background   = hov ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.45)";
    el.style.borderColor  = hov ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)";
    el.style.transform    = hov
      ? (dir === "left" ? "translateY(-50%) scale(1.08)" : "translateY(-50%) scale(1.08)")
      : "translateY(-50%) scale(1)";
  };

  return (
    <button
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => set(true)}
      onMouseLeave={() => set(false)}
      aria-label={label}
      style={{
        position:       "absolute",
        top:            "50%",
        [dir === "left" ? "left" : "right"]: 10,
        transform:      "translateY(-50%) scale(1)",
        zIndex:         10,
        width:          36,
        height:         36,
        borderRadius:   "50%",
        background:     "rgba(0,0,0,0.45)",
        border:         "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color:          "#fff",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         "pointer",
        transition:     "background 150ms ease, border-color 150ms ease, transform 180ms cubic-bezier(0.34,1.56,0.64,1)",
        opacity:        0,  // shown via CSS on parent hover — see style tag
      }}
    >
      {dir === "left" ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   ImageGallery
═══════════════════════════════════════════════════════════ */
export default function ImageGallery({ images = [], alt = "", discount = 0 }) {
  const [active,    setActive]    = useState(0);
  const [zoomed,    setZoomed]    = useState(false);
  const [zoomPos,   setZoomPos]   = useState({ x: 50, y: 50 });
  const [lightbox,  setLightbox]  = useState(false);
  const [isHovered, setIsHovered] = useState(false);   // FIX 2
  // FIX 6: fade key — changes trigger fade-in
  const [fadeKey,   setFadeKey]   = useState(0);

  const mainRef     = useRef(null);
  const lightboxRef = useRef(null);

  // Detect touch device — disable zoom on touch
  const isTouch = useRef(
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches
  );

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + images.length) % images.length);
    setFadeKey((k) => k + 1);
  }, [images.length]);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % images.length);
    setFadeKey((k) => k + 1);
  }, [images.length]);

  const goTo = useCallback((i) => {
    setActive(i);
    setFadeKey((k) => k + 1);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const fn = (e) => {
      if (!lightbox) return;
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox, prev, next]);

  // FIX 1: body scroll lock
  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [lightbox]);

  // Reset to first image when product changes
  useEffect(() => { setActive(0); setFadeKey(0); }, [images[0]]);

  // FIX 4: touch swipe on main image + lightbox
  useSwipe(mainRef,     next, prev);
  useSwipe(lightboxRef, next, prev);

  const handleMouseMove = (e) => {
    if (isTouch.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - r.left)  / r.width)  * 100,
      y: ((e.clientY - r.top)   / r.height) * 100,
    });
  };

  if (!images.length) return null;

  const canNav     = images.length > 1;
  const zoomActive = zoomed && !isTouch.current;

  return (
    <>
      {/* Hover-reveal style for nav buttons */}
      <style>{`
        .ig-wrap:hover .ig-nav-btn { opacity: 1 !important; }
        @keyframes igFadeIn {
          from { opacity: 0; transform: scale(1.015); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes lbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col gap-3" style={{ position: "sticky", top: 96 }}>

        {/* ── Main image ──────────────────────────────────── */}
        <div
          ref={mainRef}
          className="ig-wrap"
          onMouseEnter={() => { setIsHovered(true);  if (!isTouch.current) setZoomed(true);  }}
          onMouseLeave={() => { setIsHovered(false); setZoomed(false); }}
          onMouseMove={handleMouseMove}
          onClick={() => setLightbox(true)}
          style={{
            position:     "relative",
            aspectRatio:  "1/1",
            background:   "linear-gradient(160deg, var(--color-surface3) 0%, var(--color-surface2) 100%)",
            border:       "1px solid var(--color-border)",
            borderRadius: 20,
            overflow:     "hidden",
            cursor:       zoomActive ? "zoom-out" : "zoom-in",
            touchAction:  "pan-y",
          }}
        >
          {/* FIX 6: fade on image change via key */}
          <img
            key={fadeKey}
            src={images[active]}
            alt={`${alt} — ảnh ${active + 1}`}
            draggable={false}
            style={{
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              display:    "block",
              // FIX 8: zoom only on non-touch
              transformOrigin: zoomActive ? `${zoomPos.x}% ${zoomPos.y}%` : "center",
              transform:       zoomActive ? "scale(1.9)" : "scale(1)",
              transition:      zoomActive ? "transform 0ms" : "transform 300ms ease",
              animation:       "igFadeIn 220ms ease both",
            }}
          />

          {/* Discount badge */}
          {discount > 0 && (
            <span style={{
              position:    "absolute",
              top:         14,
              right:       14,
              fontFamily:  "var(--font-display)",
              fontWeight:  700,
              fontSize:    12,
              padding:     "4px 10px",
              borderRadius: 99,
              background:  "var(--color-accent2)",
              color:       "#fff",
              zIndex:      10,
              pointerEvents: "none",
              letterSpacing: "0.02em",
            }}>
              -{discount}%
            </span>
          )}

          {/* FIX 2: zoom hint — isHovered state, not group-hover */}
          {!zoomActive && isHovered && !isTouch.current && (
            <div style={{
              position:       "absolute",
              bottom:         14,
              left:           14,
              display:        "flex",
              alignItems:     "center",
              gap:            6,
              padding:        "6px 12px",
              background:     "rgba(0,0,0,0.55)",
              backdropFilter: "blur(10px)",
              borderRadius:   99,
              color:          "rgba(255,255,255,0.8)",
              fontFamily:     "var(--font-body)",
              fontSize:       11,
              fontWeight:     500,
              pointerEvents:  "none",
              animation:      "igFadeIn 150ms ease both",
              zIndex:         10,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Hover để zoom
            </div>
          )}

          {/* Counter */}
          {canNav && (
            <span style={{
              position:       "absolute",
              bottom:         14,
              right:          14,
              padding:        "4px 10px",
              background:     "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              borderRadius:   99,
              fontFamily:     "var(--font-display)",
              fontWeight:     600,
              fontSize:       11,
              color:          "rgba(255,255,255,0.8)",
              pointerEvents:  "none",
              zIndex:         10,
            }}>
              {active + 1} / {images.length}
            </span>
          )}

          {/* FIX 3: SVG nav arrows */}
          {canNav && (
            <>
              <NavButton
                onClick={prev}
                dir="left"
                label="Ảnh trước"
              />
              <NavButton
                onClick={next}
                dir="right"
                label="Ảnh tiếp theo"
              />
            </>
          )}
        </div>

        {/* ── Thumbnails — FIX 5: lazy load ─────────────── */}
        {canNav && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((src, i) => {
              const isActive = i === active;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  style={{
                    width:        60,
                    height:       60,
                    borderRadius: 10,
                    overflow:     "hidden",
                    border:       isActive
                      ? "2px solid var(--color-accent)"
                      : "2px solid var(--color-border)",
                    boxShadow:    isActive
                      ? "0 0 0 3px rgba(124,111,247,0.25)"
                      : "none",
                    background:   "var(--color-surface)",
                    padding:      0,
                    cursor:       "pointer",
                    transition:   "border-color 180ms ease, box-shadow 180ms ease, transform 180ms cubic-bezier(0.34,1.56,0.64,1)",
                    transform:    isActive ? "scale(1.06)" : "scale(1)",
                    flexShrink:   0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  <img
                    src={src}
                    alt={`${alt} thumbnail ${i + 1}`}
                    // FIX 5: first thumb eager, rest lazy
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Lightbox — FIX 1 + 7 ────────────────────────── */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem ảnh ${alt}`}
          onClick={() => setLightbox(false)}
          style={{
            position:       "fixed",
            inset:          0,
            background:     "rgba(0,0,0,0.92)",
            zIndex:         500,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            padding:        16,
            animation:      "lbFadeIn 150ms ease",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            aria-label="Đóng"
            style={{
              position:       "absolute",
              top:            16,
              right:          16,
              width:          40,
              height:         40,
              borderRadius:   "50%",
              background:     "rgba(255,255,255,0.10)",
              border:         "1px solid rgba(255,255,255,0.15)",
              color:          "rgba(255,255,255,0.8)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
              backdropFilter: "blur(8px)",
              transition:     "background 150ms ease, color 150ms ease",
              zIndex:         10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.18)";
              e.currentTarget.style.color      = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.10)";
              e.currentTarget.style.color      = "rgba(255,255,255,0.8)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>

          {/* Main lightbox image */}
          <div
            ref={lightboxRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position:   "relative",
              maxWidth:   800,
              width:      "100%",
              touchAction: "pan-y",
            }}
          >
            <img
              key={`lb-${fadeKey}`}
              src={images[active]}
              alt={`${alt} — ảnh ${active + 1} phóng to`}
              style={{
                width:        "100%",
                maxHeight:    "80vh",
                objectFit:    "contain",
                borderRadius: 14,
                display:      "block",
                animation:    "igFadeIn 180ms ease both",
              }}
            />

            {/* Lightbox arrows */}
            {canNav && (
              <>
                <button
                  onClick={prev}
                  aria-label="Ảnh trước"
                  style={{
                    position:       "absolute",
                    left:           8,
                    top:            "50%",
                    transform:      "translateY(-50%)",
                    width:          44,
                    height:         44,
                    borderRadius:   "50%",
                    background:     "rgba(0,0,0,0.55)",
                    border:         "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color:          "#fff",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    cursor:         "pointer",
                    transition:     "background 150ms ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.8)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={next}
                  aria-label="Ảnh tiếp theo"
                  style={{
                    position:       "absolute",
                    right:          8,
                    top:            "50%",
                    transform:      "translateY(-50%)",
                    width:          44,
                    height:         44,
                    borderRadius:   "50%",
                    background:     "rgba(0,0,0,0.55)",
                    border:         "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color:          "#fff",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    cursor:         "pointer",
                    transition:     "background 150ms ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.8)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails strip */}
          {canNav && (
            <div style={{
              position:       "absolute",
              bottom:         16,
              left:           "50%",
              transform:      "translateX(-50%)",
              display:        "flex",
              gap:            8,
              maxWidth:       "calc(100vw - 32px)",
              overflowX:      "auto",
              padding:        "4px 8px",
              scrollbarWidth: "none",
            }}>
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                  aria-label={`Xem ảnh ${i + 1}`}
                  style={{
                    width:        48,
                    height:       48,
                    borderRadius: 8,
                    overflow:     "hidden",
                    border:       i === active
                      ? "2px solid var(--color-accent)"
                      : "2px solid rgba(255,255,255,0.18)",
                    flexShrink:   0,
                    cursor:       "pointer",
                    transition:   "border-color 150ms ease, transform 150ms ease",
                    transform:    i === active ? "scale(1.1)" : "scale(1)",
                    padding:      0,
                    background:   "transparent",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          <p style={{
            position:   "absolute",
            bottom:     canNav ? 80 : 16,
            left:       "50%",
            transform:  "translateX(-50%)",
            fontFamily: "var(--font-body)",
            fontSize:   12,
            color:      "rgba(255,255,255,0.5)",
            whiteSpace: "nowrap",
          }}>
            {active + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}