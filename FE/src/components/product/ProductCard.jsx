/**
 * ProductCard.jsx — v3
 *
 * UI/UX overhaul dựa trên design system:
 *  - Syne (display) + DM Sans (body) đúng role
 *  - gradient-text cho giá chính
 *  - Glass morphism QuickAdd với physics press
 *  - Accent glow rim khi hover (per-product color)
 *  - StarRating clipPath + rating number
 *  - ColorSwatches ring + glow khi hover
 *  - StockBadge pulse dot
 *  - Storage options hint
 *  - Skeleton dùng đúng @utility skeleton
 */
import { useState, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useCart, useCartItem } from "../../context/CartContext";
import WishlistButton from "../common/WishlistButton";
import { formatPrice, calcDiscount } from "../../utils/helpers";

const LOW_STOCK_THRESHOLD = 5;

/* ── StarRating ─────────────────────────────────────────── */
function StarRating({ rating = 0, reviewCount = 0 }) {
  const clipId = useId();
  const pct    = Math.min(Math.max(rating / 5, 0), 1) * 100;
  if (!rating) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, lineHeight: 1 }}>
      <svg width="63" height="11" viewBox="0 0 63 11"
        aria-label={`${rating.toFixed(1)} trên 5 sao`} role="img">
        <defs>
          <clipPath id={`${clipId}-f`}>
            <rect x="0" y="0" width={`${pct}%`} height="11" />
          </clipPath>
        </defs>
        {[0,1,2,3,4].map(i => (
          <path key={i} transform={`translate(${i*13},0.5)`}
            d="M5.5 0.5l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z"
            fill="rgba(251,191,36,0.18)" />
        ))}
        <g clipPath={`url(#${clipId}-f)`}>
          {[0,1,2,3,4].map(i => (
            <path key={i} transform={`translate(${i*13},0.5)`}
              d="M5.5 0.5l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z"
              fill="var(--color-yellow)" />
          ))}
        </g>
      </svg>
      <span style={{ fontFamily:"var(--font-body)", fontWeight:500, fontSize:11, color:"var(--color-yellow)" }}>
        {rating.toFixed(1)}
      </span>
      {reviewCount > 0 && (
        <span style={{ fontFamily:"var(--font-body)", fontSize:11, color:"var(--color-muted)" }}>
          ({reviewCount.toLocaleString("vi-VN")})
        </span>
      )}
    </div>
  );
}

/* ── ColorSwatches ──────────────────────────────────────── */
function ColorSwatches({ colors = [] }) {
  const [hovered, setHovered] = useState(null);
  if (!colors.length) return null;
  const visible = colors.slice(0, 5);
  const extra   = colors.length - visible.length;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10 }}>
      {visible.map((color, i) => {
        const val   = color.value ?? color;
        const label = color.label ?? color;
        const isHov = hovered === i;
        return (
          <span key={val} title={label} aria-label={label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display:      "block",
              width:        isHov ? 16 : 13,
              height:       isHov ? 16 : 13,
              borderRadius: "50%",
              background:   val,
              border:       isHov ? "2px solid rgba(255,255,255,0.75)" : "1.5px solid rgba(255,255,255,0.12)",
              boxShadow:    isHov ? `0 0 0 2.5px ${val}55, 0 2px 8px rgba(0,0,0,0.45)` : "0 0 0 1px rgba(0,0,0,0.2)",
              transition:   "all 160ms cubic-bezier(0.34,1.56,0.64,1)",
              flexShrink:   0,
              cursor:       "default",
            }}
          />
        );
      })}
      {extra > 0 && (
        <span style={{ fontFamily:"var(--font-display)", fontSize:10, fontWeight:600, color:"var(--color-muted)", letterSpacing:"0.04em" }}>
          +{extra}
        </span>
      )}
    </div>
  );
}

/* ── StockBadge ─────────────────────────────────────────── */
function StockBadge({ stock }) {
  if (stock === undefined || stock === null || stock > LOW_STOCK_THRESHOLD) return null;
  if (stock === 0) return (
    <span style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:10,
      letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--color-red)" }}>
      Hết hàng
    </span>
  );
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      fontFamily:"var(--font-display)", fontWeight:700, fontSize:10, color:"var(--color-yellow)", letterSpacing:"0.04em" }}>
      <span style={{ position:"relative", width:6, height:6, flexShrink:0 }}>
        <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"var(--color-yellow)",
          animation:"ping 1.2s ease-out infinite", opacity:0.5 }} />
        <span style={{ position:"absolute", inset:"1px", borderRadius:"50%", background:"var(--color-yellow)" }} />
      </span>
      Chỉ còn {stock}
    </span>
  );
}

/* ── QuickAddButton ─────────────────────────────────────── */
function QuickAddButton({ onClick, inCart }) {
  const [justAdded, setJustAdded] = useState(false);
  const [pressed,   setPressed]   = useState(false);
  const showCheck = inCart || justAdded;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onClick(e);
    if (!inCart) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  }, [onClick, inCart]);

  return (
    <button
      data-quick-add
      onClick={handleClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      aria-label={showCheck ? "Đã trong giỏ hàng" : "Thêm vào giỏ nhanh"}
      style={{
        position:       "absolute",
        bottom:         12,
        right:          12,
        zIndex:         10,
        width:          36,
        height:         36,
        borderRadius:   "50%",
        border:         showCheck ? "1px solid rgba(52,212,122,0.45)" : "1px solid rgba(255,255,255,0.15)",
        background:     showCheck ? "rgba(52,212,122,0.16)" : "rgba(255,255,255,0.07)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        color:          showCheck ? "var(--color-green)" : "#fff",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         "pointer",
        boxShadow:      showCheck
          ? "0 0 14px rgba(52,212,122,0.28), inset 0 1px 0 rgba(255,255,255,0.12)"
          : "0 2px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
        opacity:        0,
        transform:      pressed ? "scale(0.86)" : "scale(0.78) translateY(4px)",
        transition:     "opacity 200ms ease, transform 200ms cubic-bezier(0.34,1.56,0.64,1), background 180ms ease, box-shadow 180ms ease, border-color 180ms ease, color 180ms ease",
      }}
    >
      {showCheck ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   ProductCard — v3
═══════════════════════════════════════════════════════════ */
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { inCart  } = useCartItem(
    product.id,
    product.colors?.[0]?.value ?? product.colors?.[0] ?? null,
    product.storage?.[0] ?? null,
  );

  const discount     = calcDiscount(product.originalPrice, product.price);
  const isOutOfStock = product.stock === 0;

  const handleQuickAdd = useCallback((e) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      image:     product.image,
      quantity:  1,
      color:     product.colors?.[0]?.value ?? product.colors?.[0] ?? null,
      storage:   product.storage?.[0] ?? null,
    });
  }, [addItem, product]);

  return (
    <>
      {/* Per-card keyframes injected once */}
      <style>{`
        @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
        .pc-wrap:hover [data-quick-add] {
          opacity: 1 !important;
          transform: scale(1) translateY(0) !important;
        }
      `}</style>

      <Link
        to={`/products/${product.id}`}
        aria-label={`${product.name} — ${formatPrice(product.price)}`}
        className="pc-wrap card-interactive block"
        style={{
          borderRadius: 18,
          opacity:      isOutOfStock ? 0.58 : 1,
          transition:   "opacity 200ms ease, transform 280ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 280ms ease, border-color 280ms ease",
        }}
      >
        {/* ── Image ── */}
        <div style={{
          position:    "relative",
          aspectRatio: "1/1",
          overflow:    "hidden",
          background:  "linear-gradient(160deg, var(--color-surface3) 0%, var(--color-surface2) 100%)",
          borderRadius: "17px 17px 0 0",
        }}>
          <img
            src={product.image} alt={product.name}
            loading="lazy" decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
            style={{ display:"block", width:"100%", height:"100%", objectFit:"cover",
              transition:"transform 500ms cubic-bezier(0.4,0,0.2,1)" }}
          />

          {/* Hover overlays */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background:"linear-gradient(to top, rgba(12,12,16,0.6) 0%, transparent 55%)" }} />

          {/* Accent glow rim — per-product color */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 115%,
                ${product.accentColor ?? "rgba(124,111,247,0.22)"} 0%, transparent 65%)`,
            }} />

          {/* Badges */}
          <div style={{ position:"absolute", top:12, left:12, display:"flex", flexDirection:"column", gap:6, zIndex:10 }}>
            {product.isNew      && <span className="badge badge-new">MỚI</span>}
            {discount > 0 && !isOutOfStock && <span className="badge badge-sale">-{discount}%</span>}
            {isOutOfStock       && <span className="badge badge-sale">Hết hàng</span>}
          </div>

          <WishlistButton
            product={{ id:product.id, name:product.name, price:product.price, image:product.image, brand:product.brand }}
            size="sm" variant="overlay"
          />

          {!isOutOfStock && <QuickAddButton onClick={handleQuickAdd} inCart={inCart} />}
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"16px 18px 18px" }}>

          {/* Brand */}
          <p className="eyebrow" style={{ marginBottom:6, opacity:0.85 }}>
            {product.brand}
          </p>

          {/* Name — Syne, 2-line clamp */}
          <h3 className="line-clamp-2" style={{
            fontFamily:    "var(--font-display)",
            fontWeight:    600,
            fontSize:      14,
            lineHeight:    1.35,
            color:         "var(--color-text2)",
            letterSpacing: "-0.01em",
            marginBottom:  10,
          }}>
            {product.name}
          </h3>

          {/* Rating */}
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />

          {/* Color swatches */}
          <ColorSwatches colors={product.colors ?? []} />

          {/* Hairline divider */}
          <div style={{ height:1, background:"var(--color-border)", margin:"12px 0", opacity:0.55 }} />

          {/* Price */}
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, flexWrap:"wrap" }}>
            <span className="gradient-text" style={{
              fontFamily:    "var(--font-display)",
              fontWeight:    800,
              fontSize:      18,
              lineHeight:    1,
              letterSpacing: "-0.025em",
            }}>
              {formatPrice(product.price)}
            </span>

            {discount > 0 && (
              <span style={{
                fontFamily:     "var(--font-body)",
                fontSize:       12,
                color:          "var(--color-muted)",
                textDecoration: "line-through",
                lineHeight:     1,
                paddingBottom:  1,
              }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}

            <span style={{ marginLeft:"auto" }}>
              <StockBadge stock={product.stock} />
            </span>
          </div>

          {/* Storage hint */}
          {product.storage?.length > 1 && (
            <p style={{
              fontFamily:  "var(--font-body)",
              fontSize:    11,
              color:       "var(--color-muted)",
              marginTop:   7,
              letterSpacing: "0.01em",
              opacity:     0.8,
            }}>
              {product.storage.join(" · ")}
            </p>
          )}
        </div>
      </Link>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ProductCardSkeleton — dùng @utility skeleton từ CSS
═══════════════════════════════════════════════════════════ */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden style={{
      borderRadius: 18,
      border:       "1px solid var(--color-border)",
      background:   "var(--color-surface)",
      overflow:     "hidden",
      pointerEvents:"none",
    }}>
      <div className="skeleton" style={{ aspectRatio:"1/1" }} />
      <div style={{ padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:10 }}>
        <div className="skeleton" style={{ height:10, width:56, borderRadius:4 }} />
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div className="skeleton" style={{ height:13, width:"100%", borderRadius:4 }} />
          <div className="skeleton" style={{ height:13, width:"70%",  borderRadius:4 }} />
        </div>
        <div className="skeleton" style={{ height:11, width:80, borderRadius:4 }} />
        <div style={{ height:1, background:"var(--color-border)", opacity:0.4 }} />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div className="skeleton" style={{ height:18, width:100, borderRadius:4 }} />
          <div className="skeleton" style={{ height:10, width:48, borderRadius:4, marginLeft:"auto" }} />
        </div>
      </div>
    </div>
  );
}