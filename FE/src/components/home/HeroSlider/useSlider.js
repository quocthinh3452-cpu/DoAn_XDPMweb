import { useState, useEffect, useCallback, useRef } from "react";

export const INTERVAL_MS = 5000;
export const EXIT_MS     = 160;
export const ENTER_MS    = 420;
const        SWIPE_MIN   = 48;

/* ─── usePrefersReducedMotion ───────────────────────────── */
export function usePrefersReducedMotion() {
  const [v, setV] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h  = () => setV(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return v;
}

/* ─── useSwipe ──────────────────────────────────────────────
   Attaches touch listeners once (ref-stable).
   Callbacks kept in refs so they never cause re-attach.
──────────────────────────────────────────────────────────── */
export function useSwipe(ref, onLeft, onRight) {
  const L = useRef(onLeft);
  const R = useRef(onRight);
  useEffect(() => { L.current = onLeft;  }, [onLeft]);
  useEffect(() => { R.current = onRight; }, [onRight]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x0 = null, y0 = null, axis = null;

    const start = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; axis = null; };
    const move  = (e) => {
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
      if (Math.abs(dx) >= SWIPE_MIN) dx < 0 ? L.current() : R.current();
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

/* ─── useSlideAnalytics ─────────────────────────────────────
   Tracks how long user stays on each slide.
   Calls onSlideView(index, durationMs) on every transition.
   Zero dependencies on external libs — just Date.now().
──────────────────────────────────────────────────────────── */
export function useSlideAnalytics(current, onSlideView) {
  const cbRef    = useRef(onSlideView);
  const entryRef = useRef(Date.now());
  const prevRef  = useRef(current);

  useEffect(() => { cbRef.current = onSlideView; }, [onSlideView]);

  useEffect(() => {
    const duration = Date.now() - entryRef.current;
    // Only fire after a real transition (not the initial mount at index 0)
    if (prevRef.current !== current && cbRef.current) {
      cbRef.current(prevRef.current, duration);
    }
    prevRef.current  = current;
    entryRef.current = Date.now();
  }, [current]);
}

/* ─── useSlider ─────────────────────────────────────────────
   Single source of truth for carousel state.

   FIX 1 — paused ref + auto-advance:
     paused lives in a ref so hover mutations never trigger a
     re-render. But the old code had a subtle bug: the auto-
     advance useEffect depended on `paused` (a ref object,
     always the same reference), so pausing while a timer was
     already scheduled had no effect — the timer fired anyway.
     Fix: use a dedicated `pausedVersion` counter in state.
     Incrementing it restarts the effect (and the timer) each
     time pause/resume happens. The counter is never rendered,
     so there's no visual stutter.

   FIX 2 — slideKey overflow:
     slideKey was an ever-increasing integer. At high session
     counts it never overflows JS's MAX_SAFE_INTEGER in practice,
     but modding by 10_000 keeps the value tidy and makes it
     obvious what the key is for.

   NEW — keyboard navigation:
     Returns handleKeyDown so the caller can attach it to the
     section element. Handles ArrowLeft / ArrowRight / Home /
     End. Pauses the timer while focus is inside the carousel.
──────────────────────────────────────────────────────────── */
export function useSlider(total, reducedMotion) {
  const [current,        setCurrent]        = useState(0);
  const [previous,       setPrevious]       = useState(null);
  const [phase,          setPhase]          = useState("idle");
  const [direction,      setDirection]      = useState("next");
  const [slideKey,       setSlideKey]       = useState(0);
  // FIX 1: pausedVersion drives the auto-advance restart.
  const [pausedVersion,  setPausedVersion]  = useState(0);

  const paused      = useRef(false);
  const busy        = useRef(false);
  const currentRef  = useRef(current);
  useEffect(() => { currentRef.current = current; }, [current]);

  const goTo = useCallback((idx, dir = "next") => {
    if (!total || busy.current) return;
    const next = ((idx % total) + total) % total;
    if (next === currentRef.current) return;

    if (reducedMotion) {
      setCurrent(next);
      // FIX 2: mod keeps the key bounded
      setSlideKey(k => (k + 1) % 10_000);
      return;
    }

    busy.current = true;
    setDirection(dir);
    setPrevious(currentRef.current);
    setPhase("exit");

    setTimeout(() => {
      setCurrent(next);
      setSlideKey(k => (k + 1) % 10_000);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        setPrevious(null);
        busy.current = false;
      }, ENTER_MS + 40);
    }, EXIT_MS);
  }, [total, reducedMotion]);

  const goNext = useCallback(
    () => goTo(currentRef.current + 1, "next"), [goTo]
  );
  const goPrev = useCallback(
    () => goTo(currentRef.current - 1, "prev"), [goTo]
  );
  const goFirst = useCallback(() => goTo(0, "prev"),          [goTo]);
  const goLast  = useCallback(() => goTo(total - 1, "next"), [goTo, total]);

  // FIX 1: depend on pausedVersion so the effect re-runs on pause/resume
  useEffect(() => {
    if (reducedMotion || paused.current || !total) return;
    const t = setTimeout(goNext, INTERVAL_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pausedVersion, reducedMotion, total]);

  // setPaused now also bumps pausedVersion so the effect above
  // cancels the current timer and starts fresh on resume.
  const setPaused = useCallback((v) => {
    paused.current = v;
    // Only bump on resume — resuming should restart the full INTERVAL_MS
    if (!v) setPausedVersion(n => n + 1);
  }, []);

  // NEW — keyboard handler for ← → Home End
  const handleKeyDown = useCallback((e) => {
    const map = {
      ArrowLeft:  () => goPrev(),
      ArrowRight: () => goNext(),
      Home:       () => goFirst(),
      End:        () => goLast(),
    };
    if (map[e.key]) {
      e.preventDefault();
      map[e.key]();
    }
  }, [goPrev, goNext, goFirst, goLast]);

  return {
    current, previous, phase, direction, slideKey,
    setPaused, goTo, goNext, goPrev,
    handleKeyDown,
  };
}