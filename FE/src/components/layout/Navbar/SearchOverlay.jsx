/* ─────────────────────────────────────────────────────────
   SearchOverlay.jsx — v2
   FIX #1  isMac bug (navigator.platform deprecated)
   FIX #2  Exit animation — isClosing state + 150ms delay
   FIX #3  Focus trap — Tab/Shift+Tab trong modal
   FIX #4  scrollbar-gutter: stable — hết layout shift
   FIX #5  Keyboard hint — ẩn khi dùng mouse, hiện khi dùng keyboard
   NEW #6  Rotating placeholder — category hints mỗi 3s
───────────────────────────────────────────────────────── */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Kbd } from "./SearchAtoms";
import { SearchResults, EmptyState } from "./SearchResults";
import { SearchIdle } from "./SearchIdle";
import {
  useDebounce, useLocalSearch,
  getHistory, saveHistory,
} from "./searchUtils";

/* ── FIX #1: isMac an toàn ── */
const isMac =
  typeof navigator !== "undefined" &&
  (navigator.userAgentData?.platform ?? navigator.platform ?? "").includes("Mac");

/* ── NEW #6: Rotating placeholder ── */
const PLACEHOLDERS = [
  "Tìm điện thoại, laptop, tai nghe…",
  "Thử \"iPhone 15\"…",
  "Thử \"MacBook Air M3\"…",
  "Thử \"AirPods Pro\"…",
  "Thử \"Samsung S24\"…",
  "Thử \"Sony WH-1000XM5\"…",
];

function useRotatingPlaceholder(active) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setIdx(i => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, [active]);
  return PLACEHOLDERS[idx];
}

/* ── FIX #3: Focus trap hook ── */
function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active) return;
    const FOCUSABLE =
      'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])';

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;
      const nodes = [...container.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const first = nodes[0];
      const last  = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [active, containerRef]);
}

export function SearchOverlay({ open, initialChar, products, onSearch, popularSearches, onClose }) {
  const navigate = useNavigate();

  const [query,        setQuery]        = useState("");
  const [asyncResults, setAsyncResults] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [selectedIdx,  setSelectedIdx]  = useState(-1);
  const [history,      setHistory]      = useState([]);

  /* ── FIX #2: Exit animation state ── */
  const [isClosing, setIsClosing] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  /* ── FIX #5: Keyboard hint visibility ── */
  const [inputMethod, setInputMethod] = useState("mouse"); // "mouse" | "keyboard"

  const inputRef     = useRef(null);
  const listRef      = useRef(null);
  const modalRef     = useRef(null);
  const closeTimer   = useRef(null);
  const debouncedQ   = useDebounce(query, 200);

  /* ── FIX #3: Focus trap ── */
  useFocusTrap(modalRef, mounted && !isClosing);

  /* ── NEW #6: Rotating placeholder — chỉ active khi query rỗng ── */
  const placeholder = useRotatingPlaceholder(mounted && !isClosing && !query);

  /* Mở / đóng với animation */
  useEffect(() => {
    if (open) {
      setIsClosing(false);
      setMounted(true);
    }
  }, [open]);

  /* Hàm đóng có animation */
  const triggerClose = useCallback(() => {
    setIsClosing(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setMounted(false);
      setQuery("");
      setAsyncResults(null);
      setLoading(false);
      setSelectedIdx(-1);
      onClose();
    }, 150); // khớp với duration animation
  }, [onClose]);

  /* Cleanup timer */
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /* Sync history + reset khi mở */
  useEffect(() => {
    if (!open) return;
    setHistory(getHistory());
    setSelectedIdx(-1);
  }, [open]);

  /* Điền ký tự ban đầu */
  useEffect(() => {
    if (!open) return;
    setQuery(initialChar ?? "");
    setAsyncResults(null);
    setLoading(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Focus */
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  /* ── FIX #5: detect input method ── */
  useEffect(() => {
    const onMouse = () => setInputMethod("mouse");
    const onKey   = (e) => {
      if (["ArrowDown", "ArrowUp", "Tab"].includes(e.key)) setInputMethod("keyboard");
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("keydown",   onKey);
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("keydown",   onKey);
    };
  }, []);

  /* Local search */
  const localResults = useLocalSearch(query, products);

  /* Async search */
  useEffect(() => {
    if (!onSearch) return;
    const q = debouncedQ.trim();
    if (!q) { setAsyncResults(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    onSearch(q)
      .then(r  => { if (!cancelled) setAsyncResults(r?.slice(0, 7) ?? []); })
      .catch(() => { if (!cancelled) setAsyncResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQ, onSearch]);

  useEffect(() => {
    if (!query.trim()) { setAsyncResults(null); setLoading(false); }
  }, [query]);

  const results = useMemo(() => {
    if (!onSearch) return localResults;
    if (asyncResults !== null) return asyncResults;
    return localResults;
  }, [onSearch, asyncResults, localResults]);
  const isFirstLoad = loading && results.length === 0;

  useEffect(() => { setSelectedIdx(-1); }, [results]);

  /* Scroll into view */
  useEffect(() => {
    if (selectedIdx < 0 || !listRef.current) return;
    listRef.current.children[selectedIdx]?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  /* Handlers */
  const handleSelect = useCallback((id) => {
    triggerClose();
    navigate(`/products/${id}`);
  }, [triggerClose, navigate]);

  const handleSubmit = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    saveHistory(q);
    setHistory(getHistory());
    triggerClose();
    navigate(`/products?search=${encodeURIComponent(q)}`);
  }, [query, triggerClose, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape")    { triggerClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      selectedIdx >= 0 && results[selectedIdx]
        ? handleSelect(results[selectedIdx].id)
        : handleSubmit();
    }
  }, [triggerClose, handleSubmit, handleSelect, results, selectedIdx]);

  const applyQuery = useCallback((q) => {
    setQuery(q);
    setSelectedIdx(-1);
    inputRef.current?.focus();
  }, []);

  const hasQuery   = query.trim().length >= 1;
  const hasResults = results.length > 0;
  const showEmpty  = !loading && !hasResults && (!onSearch || asyncResults !== null);
  const showHint   = hasResults && inputMethod === "keyboard";

  if (!mounted) return null;

  /* ── FIX #2: animation classes theo isClosing ── */
  const backdropAnim = isClosing
    ? "tsNavFadeOut 150ms ease forwards"
    : "tsNavFadeIn 140ms ease";
  const modalAnim = isClosing
    ? "tsNavSlideUp 150ms cubic-bezier(0.4,0,1,1) forwards"
    : "tsNavSlideDown 200ms cubic-bezier(0.16,1,0.3,1)";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={triggerClose}
        aria-hidden
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
          zIndex: 400,
          animation: backdropAnim,
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm sản phẩm"
        style={{
          position: "fixed", top: "10vh", left: "50%",
          transform: "translateX(-50%)",
          width: 640, maxWidth: "calc(100vw - 24px)",
          background: "var(--color-surface)",
          border: "1px solid rgba(124,111,247,0.28)",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 32px 96px rgba(0,0,0,0.85)",
          zIndex: 401,
          animation: modalAnim,
        }}
      >
        {/* Input row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 18px", height: 60,
          borderBottom: "1px solid var(--color-border)",
        }}>
          <div style={{
            flexShrink: 0, display: "flex", alignItems: "center",
            color: (loading && hasResults) ? "var(--color-accent)" : "var(--color-muted)",
            transition: "color 200ms",
          }}>
            {loading && hasResults
              ? <Spinner size={18} />
              : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              )
            }
          </div>

          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            spellCheck={false}
            /* ── NEW #6: rotating placeholder ── */
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Từ khoá tìm kiếm"
            aria-controls="search-result-list"
            aria-autocomplete="list"
            style={{
              flex: 1, background: "transparent",
              border: "none", outline: "none",
              fontFamily: "var(--font-display)", fontWeight: 500,
              fontSize: 15, color: "var(--color-text)",
              /* ── NEW #6: transition placeholder đẹp hơn ── */
              transition: "placeholder-color 300ms",
            }}
          />

          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Xoá từ khoá"
              style={{
                background: "var(--color-surface2)", border: "none",
                borderRadius: 6, padding: "3px 8px",
                fontSize: 11, color: "var(--color-muted)",
                cursor: "pointer", flexShrink: 0, transition: "color 120ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--color-muted)"; }}
            >
              Xoá
            </button>
          )}

          <Kbd>{isMac ? "⌘K" : "Ctrl K"}</Kbd>
        </div>

        {/* Body — FIX #4: scrollbar-gutter stable */}
        <div style={{
          maxHeight: 460,
          overflowY: "scroll",           /* luôn có gutter → không layout shift */
          scrollbarGutter: "stable",     /* FIX #4 */
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-border) transparent",
        }}>
          {hasQuery ? (
            <>
              <SearchResults
                results={results}
                query={query}
                selectedIdx={selectedIdx}
                onSelect={handleSelect}
                onHover={setSelectedIdx}
                onViewAll={handleSubmit}
                loading={loading}
                isFirstLoad={isFirstLoad}
                listRef={listRef}
              />
              {showEmpty && (
                <EmptyState
                  query={query}
                  popularSearches={popularSearches}
                  onPickQuery={applyQuery}
                />
              )}
            </>
          ) : (
            <SearchIdle
              history={history}
              popularSearches={popularSearches}
              onPickQuery={applyQuery}
              onClearHistory={() => setHistory([])}
            />
          )}
        </div>

        {/* Footer — FIX #5: ẩn hint khi dùng mouse */}
        <div style={{
          borderTop: "1px solid var(--color-border)", padding: "10px 18px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          minHeight: 42,
        }}>
          <div style={{
            display: "flex", gap: 12, flex: 1,
            /* ── FIX #5: fade in/out theo inputMethod ── */
            opacity:    showHint ? 1 : 0,
            transition: "opacity 200ms",
            pointerEvents: showHint ? "auto" : "none",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-muted)" }}>
              <Kbd>↑↓</Kbd> di chuyển
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-muted)" }}>
              <Kbd>↵</Kbd> chọn
            </span>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-muted)", marginLeft: "auto" }}>
            <Kbd>Esc</Kbd> đóng
          </span>
        </div>
      </div>
    </>
  );
}
