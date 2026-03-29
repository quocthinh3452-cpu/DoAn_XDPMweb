/**
 * LocaleToggle.jsx
 * Dropdown chọn Ngôn ngữ + Tiền tệ.
 * Dùng LocaleContext.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { useLocale, LANGUAGES, CURRENCIES } from "../../../context/LocaleContext";

const CLOSE_DELAY = 150;

export function LocaleToggle() {
  const { lang, currency, setLang, setCurrency } = useLocale();
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleOpen  = useCallback(() => { clearTimeout(timer.current); setOpen(true);  }, []);
  const handleClose = useCallback(() => { timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const currentCur  = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      {/* Trigger */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Ngôn ngữ và tiền tệ"
        className="h-10 flex items-center gap-1.5 px-3 bg-surface border border-border rounded-lg text-muted hover:border-accent hover:text-accent transition-all duration-200"
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>{currentLang.flag}</span>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          {currentCur.code}
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ transition: "transform 200ms", transform: open ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.5 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 220,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset",
            zIndex: 300,
            overflow: "hidden",
            animation: "localeDropIn 200ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <style>{`
            @keyframes localeDropIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }
          `}</style>

          {/* Language section */}
          <div style={{ padding: "10px 12px 6px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-muted)", marginBottom: 6 }}>
              Ngôn ngữ
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: lang === l.code ? "rgba(124,111,247,0.1)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: lang === l.code ? "var(--color-accent)" : "var(--color-text)",
                    fontFamily: "var(--font-display)",
                    fontSize: 12,
                    fontWeight: lang === l.code ? 700 : 500,
                    transition: "background 150ms, color 150ms",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{l.flag}</span>
                  <span>{l.label}</span>
                  {lang === l.code && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "auto" }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "var(--color-border)", margin: "2px 0" }} />

          {/* Currency section */}
          <div style={{ padding: "6px 12px 10px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-muted)", marginBottom: 6 }}>
              Tiền tệ
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: currency === c.code ? "rgba(124,111,247,0.1)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: currency === c.code ? "var(--color-accent)" : "var(--color-text)",
                    fontFamily: "var(--font-display)",
                    fontSize: 12,
                    fontWeight: currency === c.code ? 700 : 500,
                    transition: "background 150ms, color 150ms",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, width: 18, textAlign: "center", color: currency === c.code ? "var(--color-accent)" : "var(--color-muted)" }}>{c.symbol}</span>
                  <span>{c.label}</span>
                  {currency === c.code && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "auto" }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
