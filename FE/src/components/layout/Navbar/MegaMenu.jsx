/**
 * MegaMenu.jsx
 *
 * FIX: MEGA_CATS ids khớp với CATEGORIES trong mockProducts.js
 * Click vào category → navigate("/products?category=smartphone")
 * → ProductsPage đọc URL param → filter hoạt động đúng.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { CAT_ICONS, FallbackCatIcon } from "./NavbarIcons";

// ⚠️ id phải khớp CHÍNH XÁC với category field trong mockProducts.js
export const MEGA_CATS = [
  { id: "smartphone", label: "Điện thoại",    accent: "#3B82F6" },
  { id: "laptop",     label: "Laptop",        accent: "#8B5CF6" },
  { id: "audio",      label: "Âm thanh",      accent: "#10B981" },
  { id: "tablet",     label: "Máy tính bảng", accent: "#F59E0B" },
  { id: "wearable",   label: "Wearable",      accent: "#EF4444" },
];

const CLOSE_DELAY = 180;

export function MegaMenu({ isActive }) {
  const [open, setOpen] = useState(false);
  const timer      = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleOpen  = useCallback(() => { clearTimeout(timer.current); setOpen(true);  }, []);
  const handleClose = useCallback(() => { timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY); }, []);
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
  }, []);

  const navLink    = "text-sm font-medium text-muted hover:text-text transition-colors duration-200";
  const activeLink = "text-text";

  return (
    <>
      <style>{`
        @keyframes megaMenuIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); filter: blur(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    filter: blur(0);  }
        }
      `}</style>

      <div
        className="relative"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onKeyDown={handleKeyDown}
      >
        <Link
          ref={triggerRef}
          to="/products"
          className={`${navLink} ${isActive ? activeLink : ""} flex items-center gap-1 select-none`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          Sản phẩm
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transition: "transform 200ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.5 }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {open && (
          <div
            className="absolute left-1/2 w-[340px] bg-surface border border-border rounded-2xl overflow-hidden z-[300]"
            style={{
              top: "calc(100% + 12px)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset",
              animation: "megaMenuIn 200ms cubic-bezier(0.16,1,0.3,1) both",
            }}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            role="menu"
            aria-label="Danh mục sản phẩm"
          >
            {/* Header */}
            <div className="px-4 pt-3.5 pb-2.5 border-b border-border">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)", letterSpacing: "0.1em" }}>
                Danh mục
              </p>
            </div>

            {/* Grid */}
            <div className="p-2">
              <div className="grid grid-cols-2 gap-[3px]">
                {MEGA_CATS.map(cat => (
                  <Link
                    key={cat.id}
                    // ✅ Truyền đúng cat.id vào URL query
                    to={`/products?category=${cat.id}`}
                    role="menuitem"
                    className="group flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all duration-150"
                    style={{ color: "var(--color-muted)" }}
                    onClick={() => setOpen(false)}
                    onFocus={handleOpen}
                  >
                    <span
                      className="flex items-center justify-center rounded-lg shrink-0 transition-all duration-150 group-hover:scale-110"
                      style={{ width: 30, height: 30, background: `${cat.accent}18`, color: cat.accent }}
                    >
                      <span style={{ width: 15, height: 15, display: "flex" }}>
                        {CAT_ICONS[cat.id] ?? <FallbackCatIcon />}
                      </span>
                    </span>
                    <span className="text-sm font-semibold transition-colors duration-150 group-hover:text-text">
                      {cat.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-2 pb-2">
              <Link
                to="/products"
                role="menuitem"
                className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl transition-all duration-150 group"
                style={{ background: "var(--color-surface2)", color: "var(--color-accent)" }}
                onClick={() => setOpen(false)}
              >
                <span className="text-sm font-semibold">Xem tất cả sản phẩm</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-150 group-hover:translate-x-0.5">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}