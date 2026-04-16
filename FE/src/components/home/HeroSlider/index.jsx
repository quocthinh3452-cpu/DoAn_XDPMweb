/**
 * HeroSlider/index.jsx
 *
 * Structure:
 *   useSlider.js   — all carousel state (current, phase, direction, …)
 *   SliderUI.jsx   — every presentational component (BgLayer, NavBtn, …)
 *   index.jsx      — wires them together; ~80 lines
 *
 * Performance contract (unchanged):
 *   • Only `opacity` and `transform` are ever animated → GPU-composited, zero repaint.
 *   • AmbientOrb uses a small physical element + scale() instead of a large blurred div.
 *   • Hover states on buttons/CTAs mutate the DOM directly (no setState → no re-render).
 *   • Background transitions via cross-fading two BgLayer divs (not transitioning `background`).
 *
 * New in this version:
 *   • handleKeyDown  → ← → Home End navigate slides; focus also pauses auto-advance.
 *   • onSlideView    → callback prop for analytics (slideIndex, durationMs).
 *   • useImagePreloader → next slide image is prefetched one step ahead.
 *   • PriceBadge / StockBadge / RatingStars → product info inline with text.
 *
 * Slide data shape (additions marked NEW):
 * {
 *   title         : string
 *   subtitle      : string
 *   tag           : string
 *   badge         : string
 *   cta           : string
 *   ctaLink       : string
 *   secondaryCta  : string
 *   secondaryLink : string
 *   image         : string
 *   accentColor   : string   — hex / hsl
 *   bgFrom        : string
 *   bgTo          : string
 *   price         : string   — NEW  "12.990.000₫"
 *   originalPrice : string   — NEW  "15.990.000₫"  (optional)
 *   discountPct   : number   — NEW  19              (optional)
 *   stock         : string   — NEW  "in_stock" | "low_stock" | "out_of_stock"
 *   stockLabel    : string   — NEW  "Chỉ còn 3 sản phẩm"   (optional)
 *   rating        : number   — NEW  4.7                      (optional)
 *   reviewCount   : number   — NEW  1240                     (optional)
 * }
 */
import { useRef, useCallback } from "react";
import {
  usePrefersReducedMotion,
  useSwipe,
  useSlider,
  useSlideAnalytics,
} from "./useSlider";
import {
  BgLayer,
  AmbientOrb,
  NavBtn,
  Indicators,
  ProgressBar,
  SlideImage,
  PriceBadge,
  StockBadge,
  RatingStars,
  PrimaryBtn,
  SecondaryBtn,
  phaseStyle,
  useImagePreloader,
} from "./SliderUI";

/**
 * @param {object[]} slides   — Array of slide data objects (see shape above).
 * @param {function} onSlideView — Optional analytics callback.
 *   Called with (slideIndex: number, durationMs: number) every time
 *   the user leaves a slide, including auto-advance.
 *   Example: onSlideView={(i, ms) => gtag("event", "slide_view", { slide: i, ms })}
 */
export default function HeroSlider({ slides, onSlideView }) {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef    = useRef(null);
  const barRef        = useRef(null);

  const {
    current, previous, phase, direction, slideKey,
    setPaused, goTo, goNext, goPrev,
    handleKeyDown,
  } = useSlider(slides?.length ?? 0, reducedMotion);

  // Analytics — tracks dwell time per slide
  useSlideAnalytics(current, onSlideView);

  // Preload next slide's image before it's needed
  useImagePreloader(slides, current);

  // Touch swipe
  useSwipe(sectionRef, goNext, goPrev);

  // Pause auto-advance while keyboard focus is inside the carousel
  const handleFocus = useCallback(() => {
    setPaused(true);
    if (barRef.current) barRef.current.style.animationPlayState = "paused";
  }, [setPaused]);

  const handleBlur = useCallback((e) => {
    // Only unpause if focus has left the entire carousel section
    if (!sectionRef.current?.contains(e.relatedTarget)) {
      setPaused(false);
      if (barRef.current) barRef.current.style.animationPlayState = "running";
    }
  }, [setPaused]);

  if (!slides?.length) return null;

  const slide      = slides[current];
  const prevSlide  = previous !== null ? slides[previous] : null;
  const titlePlain = slide.title.replaceAll("\n", " ");

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onMouseEnter={() => {
        setPaused(true);
        if (barRef.current) barRef.current.style.animationPlayState = "paused";
      }}
      onMouseLeave={() => {
        setPaused(false);
        if (barRef.current) barRef.current.style.animationPlayState = "running";
      }}
      // NEW — keyboard navigation
      onKeyDown={handleKeyDown}
      // NEW — pause on focus, resume on blur
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="group relative min-h-[600px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--color-bg)] border-b border-white/[0.06]"
      style={{ touchAction: "pan-y", boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.28)" }}
    >
      {/* ── Backgrounds ── */}
      {prevSlide && <BgLayer key={`bg-prev-${previous}-${slideKey}`} slide={prevSlide} isActive={false} reducedMotion={reducedMotion} />}
      <BgLayer key={`bg-curr-${current}-${slideKey}`} slide={slide} isActive={true} reducedMotion={reducedMotion} />

      {/* ── Ambient orbs ── */}
      {[current, previous].filter(i => i !== null).map(i => (
        <AmbientOrb key={`orb-${i}-${i === current ? 'curr' : 'prev'}-${slideKey}`} slide={slides[i]} slideIndex={i} isActive={i === current} reducedMotion={reducedMotion} />
      ))}

      {/* ── Grid texture ── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
          backgroundSize:  "52px 52px",
        }} />

      {/* ── Content grid ── */}
      <div className="container-page relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-12 min-h-[600px] pt-14 pb-28">

        {/* Left: text */}
        <div style={phaseStyle(phase, direction, reducedMotion, 0)}
          className="flex flex-col gap-4 text-center md:text-left" aria-live="polite">

          {/* Tag */}
          <span className="inline-flex items-center w-fit mx-auto md:mx-0 font-display font-bold uppercase"
            style={{ fontSize: 11, letterSpacing: "0.11em", padding: "6px 14px", borderRadius: 99,
              border: `1px solid ${slide.accentColor}40`, color: slide.accentColor, background: `${slide.accentColor}16` }}>
            {slide.tag}
          </span>

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, lineHeight: 1.03,
            letterSpacing: "-0.032em", fontSize: "clamp(38px,5vw,64px)", color: "var(--color-text)" }}>
            {slide.title.split("\n").map((line, i) => (
              <span key={i} className="block"
                style={reducedMotion ? {} : { animation: `slideUp 500ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}>
                {line}
              </span>
            ))}
          </h1>

          {/* NEW — Rating (hiện ngay dưới tiêu đề) */}
          <div className="flex justify-center md:justify-start">
            <RatingStars slide={slide} />
          </div>

          {/* Subtitle */}
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.72,
            color: "var(--color-muted)", maxWidth: 430, margin: "0 auto" }} className="md:mx-0">
            {slide.subtitle}
          </p>

          {/* Badge (feature highlight) */}
          <span className="inline-flex items-center gap-2 w-fit mx-auto md:mx-0 font-display font-semibold"
            style={{ fontSize: 13, padding: "7px 16px", borderRadius: 99,
              border: `1px solid ${slide.accentColor}35`, background: `${slide.accentColor}12`, color: slide.accentColor }}>
            <span aria-hidden style={{ opacity: 0.6 }}>✦</span>{slide.badge}
          </span>

          {/* NEW — Price + Stock */}
          <div className="flex flex-col gap-2 items-center md:items-start">
            <PriceBadge slide={slide} reducedMotion={reducedMotion} />
            <StockBadge slide={slide} />
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start" style={{ marginTop: 2 }}>
            <PrimaryBtn slide={slide} />
            <SecondaryBtn slide={slide} />
          </div>
        </div>

        {/* Right: image */}
        <div style={phaseStyle(phase, direction, reducedMotion, 70)}
          className="relative flex items-center justify-center order-first md:order-last">
          <div aria-hidden style={{
            position: "absolute", inset: -50, borderRadius: "50%",
            background: `radial-gradient(circle, ${slide.accentColor}22 0%, transparent 62%)`,
          }} />
          <div className="relative z-10 w-full" style={{ maxWidth: 460 }}>
            <SlideImage src={slide.image} alt={titlePlain} accentColor={slide.accentColor} />
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <NavBtn onClick={goPrev} ariaLabel="Previous slide" dir="left"  accentColor={slide.accentColor} />
      <NavBtn onClick={goNext} ariaLabel="Next slide"     dir="right" accentColor={slide.accentColor} />
      <Indicators slides={slides} current={current} accentColor={slide.accentColor}
        onGoTo={(i) => goTo(i, i > current ? "next" : "prev")} />
      <ProgressBar accentColor={slide.accentColor} slideKey={slideKey} barRef={barRef} reducedMotion={reducedMotion} />
    </section>
  );
}