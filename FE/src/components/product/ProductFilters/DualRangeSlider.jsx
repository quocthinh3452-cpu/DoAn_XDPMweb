/**
 * DualRangeSlider.jsx
 * Safari-safe dual range slider — pointer events only.
 * Không dùng 2 input[range] overlap (vỡ trên Safari/iOS).
 */
import { useRef, useEffect, useCallback } from "react";
import { clamp, formatPrice } from "./FilterContext";

export default function DualRangeSlider({
  value,
  onChange,
  bounds,
  step = 500_000,
}) {
  const trackRef = useRef(null);
  const dragging = useRef(null); // "min" | "max" | null

  const toPct = useCallback(
    (v) => ((v - bounds.min) / (bounds.max - bounds.min)) * 100,
    [bounds],
  );

  const fromPct = useCallback(
    (p) => {
      const raw = bounds.min + (p / 100) * (bounds.max - bounds.min);
      return Math.round(raw / step) * step;
    },
    [bounds, step],
  );

  const pctFromEvent = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect   = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  }, []);

  const handleMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const raw = fromPct(pctFromEvent(e));
    const GAP = step;
    if (dragging.current === "min") {
      onChange({ min: clamp(raw, bounds.min, value.max - GAP), max: value.max });
    } else {
      onChange({ min: value.min, max: clamp(raw, value.min + GAP, bounds.max) });
    }
  }, [dragging, fromPct, pctFromEvent, onChange, bounds, value, step]);

  const handleUp = useCallback(() => { dragging.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove",  handleMove);
    window.addEventListener("mouseup",    handleUp);
    window.addEventListener("touchmove",  handleMove, { passive: false });
    window.addEventListener("touchend",   handleUp);
    return () => {
      window.removeEventListener("mousemove",  handleMove);
      window.removeEventListener("mouseup",    handleUp);
      window.removeEventListener("touchmove",  handleMove);
      window.removeEventListener("touchend",   handleUp);
    };
  }, [handleMove, handleUp]);

  // Click track → move nearest thumb
  const handleTrackClick = useCallback((e) => {
    if (dragging.current) return;
    const raw  = fromPct(pctFromEvent(e));
    const dMin = Math.abs(raw - value.min);
    const dMax = Math.abs(raw - value.max);
    if (dMin <= dMax) {
      onChange({ min: clamp(raw, bounds.min, value.max - step), max: value.max });
    } else {
      onChange({ min: value.min, max: clamp(raw, value.min + step, bounds.max) });
    }
  }, [fromPct, pctFromEvent, value, onChange, bounds, step]);

  const pMin = toPct(value.min);
  const pMax = toPct(value.max);

  const thumbBase = {
    position: "absolute", top: "50%",
    width: 18, height: 18, borderRadius: "50%",
    background: "var(--color-accent)",
    border: "2.5px solid var(--color-bg)",
    boxShadow: "0 0 0 2px var(--color-accent), 0 2px 6px rgba(0,0,0,0.3)",
    cursor: "grab", touchAction: "none", userSelect: "none",
    transition: "box-shadow 150ms ease",
  };

  return (
    <div style={{ paddingTop: 6, paddingBottom: 2 }}>
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{ position: "relative", height: 20, marginBottom: 14, cursor: "pointer" }}
      >
        {/* Base track */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: "50%", height: 4,
          transform: "translateY(-50%)", borderRadius: 99,
          background: "var(--color-surface3)",
        }} />
        {/* Active fill */}
        <div style={{
          position: "absolute",
          left: `${pMin}%`, right: `${100 - pMax}%`,
          top: "50%", height: 4, transform: "translateY(-50%)",
          borderRadius: 99, background: "var(--color-accent)",
          pointerEvents: "none",
        }} />

        {/* Thumb MIN */}
        <div
          style={{ ...thumbBase, left: `${pMin}%`, transform: "translate(-50%,-50%)", zIndex: pMin > 85 ? 4 : 3 }}
          onMouseDown={e => { e.preventDefault(); dragging.current = "min"; }}
          onTouchStart={e => { e.preventDefault(); dragging.current = "min"; }}
          role="slider" aria-label="Giá tối thiểu"
          aria-valuenow={value.min} aria-valuemin={bounds.min} aria-valuemax={value.max}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "ArrowLeft")  onChange({ ...value, min: clamp(value.min - step, bounds.min, value.max - step) });
            if (e.key === "ArrowRight") onChange({ ...value, min: clamp(value.min + step, bounds.min, value.max - step) });
          }}
        />

        {/* Thumb MAX */}
        <div
          style={{ ...thumbBase, left: `${pMax}%`, transform: "translate(-50%,-50%)", zIndex: 3 }}
          onMouseDown={e => { e.preventDefault(); dragging.current = "max"; }}
          onTouchStart={e => { e.preventDefault(); dragging.current = "max"; }}
          role="slider" aria-label="Giá tối đa"
          aria-valuenow={value.max} aria-valuemin={value.min} aria-valuemax={bounds.max}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "ArrowLeft")  onChange({ ...value, max: clamp(value.max - step, value.min + step, bounds.max) });
            if (e.key === "ArrowRight") onChange({ ...value, max: clamp(value.max + step, value.min + step, bounds.max) });
          }}
        />
      </div>

      {/* Price labels */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        {[
          formatPrice(value.min) + "₫",
          value.max >= bounds.max ? "Tất cả" : formatPrice(value.max) + "₫",
        ].map((label, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
            color: "var(--color-text)", background: "var(--color-surface2)",
            border: "1px solid var(--color-border)",
            padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap",
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
