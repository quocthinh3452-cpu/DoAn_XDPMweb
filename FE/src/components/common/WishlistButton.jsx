import { cn } from "../../utils/cn";
import { useWishlist } from "../../context/WishlistContext";

const HeartIcon = ({ active, className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ICON_SIZE = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };

export default function WishlistButton({ product, size = "md", variant = "overlay" }) {
  const { toggle, isWishlisted } = useWishlist();
  const active = isWishlisted(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      image:     product.image,
      brand:     product.brand,
    });
  };

  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        title={active ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute top-2.5 right-2.5 z-10",
          "w-8 h-8 rounded-full flex items-center justify-center",
          "border backdrop-blur-sm transition-all duration-200",
          active
            ? "opacity-100 scale-100 bg-rose-500/20 border-rose-500/40 text-rose-400"
            : "opacity-0 group-hover:opacity-100 scale-[0.85] group-hover:scale-100 bg-bg/70 border-white/10 text-white"
        )}
      >
        <HeartIcon active={active} className={cn(ICON_SIZE[size], active && "[animation:heartPop_350ms_cubic-bezier(0.175,0.885,0.32,1.275)]")} />
      </button>
    );
  }

  // inline variant
  return (
    <button
      onClick={handleClick}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2.5",
        "rounded-[10px] border font-display font-semibold text-sm",
        "transition-all duration-200",
        active
          ? "border-rose-500/40 bg-rose-500/8 text-rose-400"
          : "border-border bg-surface text-muted hover:border-rose-500 hover:text-rose-400"
      )}
    >
      <HeartIcon active={active} className={ICON_SIZE[size]} />
      {active ? "Wishlisted" : "Wishlist"}
    </button>
  );
}
