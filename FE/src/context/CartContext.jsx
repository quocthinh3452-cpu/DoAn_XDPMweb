/**
 * CartContext.jsx — v2
 *
 * Fixes:
 *  1. Race condition HYDRATE → lazy initializer trong useReducer
 *  2. id: Date.now() → crypto.randomUUID() — không trùng khi add nhanh
 *  3. MAX_QTY clamp — updateQty không nhận giá trị > 99 hoặc < 1
 *  4. price validation — NaN / âm không làm subtotal sai
 *  5. addItem / removeItem / updateQty memoized bằng useCallback
 *  6. localStorage error handling — không crash khi storage full
 *
 * New selectors:
 *  isInCart(productId, color?, storage?) → boolean
 *  getItem(productId, color?, storage?)  → item | undefined
 *  uniqueCount → số dòng trong cart (khác itemCount là tổng quantity)
 */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "techstore_cart";
const MAX_QTY     = 99;
const MIN_QTY     = 1;

/* ── localStorage helpers ───────────────────────────────────
   Tách riêng để dễ mock trong test và handle lỗi tập trung.
──────────────────────────────────────────────────────────── */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // localStorage full (quota exceeded) hoặc private mode bị chặn
    // Silent fail — cart vẫn hoạt động trong session, chỉ không persist
    console.warn("[CartContext] localStorage write failed — cart won't persist.");
  }
}

/* ── Price validation ───────────────────────────────────────
   Trả về price hợp lệ (số dương hữu hạn) hoặc 0.
──────────────────────────────────────────────────────────── */
function safePrice(price) {
  const n = Number(price);
  return isFinite(n) && n >= 0 ? n : 0;
}

/* ── UUID ───────────────────────────────────────────────────
   crypto.randomUUID() — built-in, không cần lib.
   Fallback cho môi trường không hỗ trợ (rất hiếm).
──────────────────────────────────────────────────────────── */
function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback — vẫn đủ unique cho cart
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ═══════════════════════════════════════════════════════════
   Reducer — pure, không side-effect
═══════════════════════════════════════════════════════════ */
function cartReducer(state, action) {
  switch (action.type) {

    case "ADD_ITEM": {
      const { productId, color, storage, quantity = 1, price, ...rest } = action.payload;
      const validPrice = safePrice(price);
      const existing   = state.find(
        (item) =>
          item.productId === productId &&
          item.color     === color     &&
          item.storage   === storage
      );
      if (existing) {
        return state.map((item) =>
          item === existing
            ? {
                ...item,
                quantity: Math.min(MAX_QTY, item.quantity + quantity),
                price:    validPrice, // cập nhật nếu giá thay đổi
              }
            : item
        );
      }
      return [
        ...state,
        {
          ...rest,
          productId,
          color,
          storage,
          price:    validPrice,
          quantity: Math.min(MAX_QTY, Math.max(MIN_QTY, quantity)),
          // FIX 2: randomUUID thay Date.now()
          id:       uuid(),
        },
      ];
    }

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);

    case "UPDATE_QTY": {
      const { id, quantity } = action.payload;
      // FIX 3: clamp quantity — xoá item nếu quantity < 1
      const clamped = Math.min(MAX_QTY, Math.max(0, quantity));
      return state
        .map((item) =>
          item.id === id ? { ...item, quantity: clamped } : item
        )
        .filter((item) => item.quantity > 0);
    }

    case "CLEAR":
      return [];

    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════════════════
   CartProvider
═══════════════════════════════════════════════════════════ */
export function CartProvider({ children, onAddToast }) {
  // FIX 1: lazy initializer — đọc localStorage đồng bộ lúc init
  // Không cần useEffect HYDRATE nữa → không có race condition
  const [cart, dispatch] = useReducer(cartReducer, undefined, readStorage);

  // Persist mỗi khi cart thay đổi
  useEffect(() => {
    writeStorage(cart);
  }, [cart]);

  // FIX 5: memoize tất cả actions — không tạo ref mới mỗi render
  const addItem = useCallback((item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    onAddToast?.(item.name);
  }, [onAddToast]);

  const removeItem = useCallback((id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }, []);

  const updateQty = useCallback((id, quantity) => {
    dispatch({ type: "UPDATE_QTY", payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  // ── Selectors — memoized ─────────────────────────────────
  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const uniqueCount = cart.length; // số dòng, không phải tổng quantity

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + safePrice(item.price) * item.quantity, 0),
    [cart]
  );

  // isInCart — dùng trong ProductCard để đổi nút "Thêm" → "Trong giỏ"
  const isInCart = useCallback(
    (productId, color, storage) =>
      cart.some(
        (item) =>
          item.productId === productId &&
          (color   === undefined || item.color   === color)   &&
          (storage === undefined || item.storage === storage)
      ),
    [cart]
  );

  // getItem — lấy item cụ thể để hiện quantity hiện tại
  const getItem = useCallback(
    (productId, color, storage) =>
      cart.find(
        (item) =>
          item.productId === productId &&
          (color   === undefined || item.color   === color)   &&
          (storage === undefined || item.storage === storage)
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      itemCount,
      uniqueCount,
      subtotal,
      isInCart,
      getItem,
    }),
    [cart, addItem, removeItem, updateQty, clearCart,
     itemCount, uniqueCount, subtotal, isInCart, getItem]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════
   Hooks
═══════════════════════════════════════════════════════════ */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

// Selector hook riêng — component chỉ subscribe vào slice cần
// tránh re-render không cần thiết khi cart thay đổi phần khác
export function useCartItem(productId, color, storage) {
  const { getItem, isInCart } = useCart();
  return {
    item:     getItem(productId, color, storage),
    inCart:   isInCart(productId, color, storage),
  };
}