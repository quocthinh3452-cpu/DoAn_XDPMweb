/**
 * MiniCartPreview.jsx
 * Hover vào cart icon → hiện preview tối đa 3 items + subtotal.
 * Wrap cart Link bằng component này thay thế.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

const CLOSE_DELAY = 160;

function formatVND(n) {
  return `${Number(n).toLocaleString("vi-VN")}₫`;
}

export function MiniCartPreview({ itemCount, pathname }) {
  const { cart, subtotal } = useCart();
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleOpen  = useCallback(() => { clearTimeout(timer.current); setOpen(true);  }, []);
  const handleClose = useCallback(() => { timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY); }, []);

  const preview = cart.slice(0, 3);
  const hasMore = cart.length > 3;

  return (
    <div
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      {/* Cart button — giữ nguyên style gốc */}
      <Link
        to="/cart"
        aria-label={`Giỏ hàng${itemCount > 0 ? ` (${itemCount})` : ""}`}
        className="relative w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-lg text-text hover:border-accent hover:text-accent transition-all duration-200"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs font-bold min-w-5 h-5 rounded-full flex items-center justify-center px-1" aria-hidden>
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>

      {/* Preview dropdown — chỉ hiện khi có item */}
      {open && cart.length > 0 && (
        <div
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 300,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset",
            zIndex: 300,
            overflow: "hidden",
            animation: "miniCartIn 200ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <style>{`
            @keyframes miniCartIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }
          `}</style>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 10px", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              Giỏ hàng ({cart.length})
            </span>
            <Link
              to="/cart"
              style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}
            >
              Xem tất cả →
            </Link>
          </div>

          {/* Items */}
          <div>
            {preview.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: "var(--color-surface2)",
                  border: "1px solid var(--color-border)",
                  flexShrink: 0,
                  overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 12, fontWeight: 600, color: "var(--color-text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    marginBottom: 2,
                  }}>
                    {item.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {item.color && (
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
                    )}
                    {item.storage && (
                      <span style={{ fontSize: 10, color: "var(--color-muted)", fontWeight: 600 }}>{item.storage}</span>
                    )}
                    <span style={{ fontSize: 10, color: "var(--color-muted)" }}>×{item.quantity}</span>
                  </div>
                </div>

                {/* Price */}
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-accent)", flexShrink: 0 }}>
                  {formatVND(item.price * item.quantity)}
                </span>
              </div>
            ))}

            {hasMore && (
              <div style={{ padding: "8px 14px", textAlign: "center", color: "var(--color-muted)", fontSize: 11 }}>
                +{cart.length - 3} sản phẩm khác
              </div>
            )}
          </div>

          {/* Footer — subtotal + CTA */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>Tổng tạm tính</span>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
                {formatVND(subtotal)}
              </span>
            </div>
            <Link
              to="/checkout"
              style={{
                display: "block",
                textAlign: "center",
                padding: "9px 0",
                borderRadius: 10,
                background: "linear-gradient(to bottom, var(--color-accent-hl), var(--color-accent-dim))",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(108,95,255,0.35)",
                transition: "box-shadow 200ms, transform 200ms",
              }}
            >
              Thanh toán ngay →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
