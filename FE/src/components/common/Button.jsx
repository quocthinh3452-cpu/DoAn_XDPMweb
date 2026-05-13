import { useRef } from "react";
import { cn } from "../../utils/cn";

/* ─────────────────────────────────────────────
   CSS class maps (styles live in buttons.css)
───────────────────────────────────────────── */
const SIZE_CLS = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};
const VARIANT_CLS = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  ghost:     "btn-ghost",
  danger:    "btn-danger",
};

/* ─────────────────────────────────────────────
   Ripple spawner
───────────────────────────────────────────── */
function spawnRipple(e, ref) {
  const btn = ref.current;
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const x    = e.clientX - rect.left;
  const y    = e.clientY - rect.top;

  const ripple = document.createElement("span");
  ripple.className = "btn-ripple";
  ripple.style.left = `${x}px`;
  ripple.style.top  = `${y}px`;
  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

/* ─────────────────────────────────────────────
   Loading spinner SVG
───────────────────────────────────────────── */
const Spinner = () => (
  <svg className="btn-spinner-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2.5" />
    <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ─────────────────────────────────────────────
   Button
───────────────────────────────────────────── */
export default function Button({
  children,
  variant   = "primary",
  size      = "md",
  loading   = false,
  disabled  = false,
  fullWidth = false,
  onClick,
  type      = "button",
  className,
  ...props
}) {
  const ref        = useRef(null);
  const isShimmer  = variant === "primary" || variant === "danger";
  const isDisabled = disabled || loading;

  const handleClick = (e) => {
    if (!isDisabled) {
      spawnRipple(e, ref);
      onClick?.(e);
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "btn",
        VARIANT_CLS[variant],
        SIZE_CLS[size],
        fullWidth && "btn-full",
        loading   && "btn-loading",
        className,
      )}
      {...props}
    >
      {/* Shimmer sweep (primary / danger only, not while disabled) */}
      {isShimmer && !isDisabled && (
        <span className="btn-shimmer" aria-hidden="true" />
      )}

      {/* Loading state */}
      {loading ? (
        <>
          <Spinner />
          <span className="btn-loading-text">
            {typeof children === "string" ? children : "Loading…"}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}