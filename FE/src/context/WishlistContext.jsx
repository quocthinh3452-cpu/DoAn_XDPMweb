import { createContext, useContext, useReducer, useEffect } from "react";
import { useToast } from "./ToastContext";

// ── State: wishlist = [{ id, productId, name, price, image, brand, addedAt }]
const WishlistContext = createContext(null);
const STORAGE_KEY = "techstore_wishlist";

function wishlistReducer(state, action) {
  switch (action.type) {
    case "TOGGLE": {
      const exists = state.find((i) => i.productId === action.payload.productId);
      if (exists) return state.filter((i) => i.productId !== action.payload.productId);
      return [{ ...action.payload, id: Date.now(), addedAt: new Date().toISOString() }, ...state];
    }
    case "REMOVE":
      return state.filter((i) => i.productId !== action.payload);
    case "CLEAR":
      return [];
    case "HYDRATE":
      return action.payload;
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, dispatch] = useReducer(wishlistReducer, []);
  const { success, info }    = useToast();

  // Hydrate
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) dispatch({ type: "HYDRATE", payload: JSON.parse(stored) });
    } catch (_) {}
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = (product) => {
    const exists = wishlist.some((i) => i.productId === product.productId);
    dispatch({ type: "TOGGLE", payload: product });
    if (exists) {
      info("Removed from wishlist", product.name);
    } else {
      success("Added to wishlist", product.name);
    }
  };

  const remove      = (productId) => dispatch({ type: "REMOVE", payload: productId });
  const clear       = ()           => dispatch({ type: "CLEAR" });
  const isWishlisted = (productId) => wishlist.some((i) => i.productId === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, remove, clear, isWishlisted, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
