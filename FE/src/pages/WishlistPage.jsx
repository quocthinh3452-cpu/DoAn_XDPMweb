import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/helpers";
import Button from "../components/common/Button";
import WishlistButton from "../components/common/WishlistButton";

export default function WishlistPage() {
  const { wishlist, clear, count } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item) => addItem({ productId: item.productId, name: item.name, price: item.price, image: item.image, quantity: 1, color: null, storage: null });

  if (wishlist.length === 0) return (
    <div className="container-page py-12 flex flex-col items-center gap-4 pt-24 text-center">
      <span className="text-6xl">🤍</span>
      <h2 className="font-display text-3xl font-extrabold">Your wishlist is empty</h2>
      <p className="text-muted text-sm">Save products you love and come back to them later.</p>
      <Link to="/products"><Button variant="primary" size="lg">Browse Products</Button></Link>
    </div>
  );

  return (
    <div className="container-page py-12 pb-20">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-1">Wishlist</h1>
          <p className="text-muted text-sm">{count} saved product{count !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={clear} className="text-xs text-muted hover:text-red underline transition-colors">Clear all</button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
        {wishlist.map((item) => (
          <div key={item.id} className="relative bg-surface border border-border rounded-xl overflow-hidden flex flex-col hover:border-white/12 hover:-translate-y-0.5 transition-all duration-200">
            <WishlistButton product={{ id: item.productId, name: item.name, price: item.price, image: item.image, brand: item.brand }} size="sm" variant="overlay" />
            <Link to={`/products/${item.productId}`} className="block aspect-square overflow-hidden bg-surface2">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-[400ms]" />
            </Link>
            <div className="p-4 flex flex-col gap-1 flex-1">
              <p className="text-xs font-bold text-accent uppercase tracking-[0.8px]">{item.brand}</p>
              <Link to={`/products/${item.productId}`} className="text-sm font-semibold text-text leading-snug line-clamp-2 hover:text-accent transition-colors">{item.name}</Link>
              <p className="font-display text-base font-bold mt-1">{formatPrice(item.price)}</p>
              <p className="text-xs text-muted">Saved {new Date(item.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              <div className="mt-auto pt-3">
                <Button variant="primary" size="sm" fullWidth onClick={() => handleAddToCart(item)}>Add to Cart</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
