// ============================================================
// WISHLIST SERVICE
// ============================================================
// Future Laravel endpoints:
//   GET    /api/wishlist              → getWishlist()
//   POST   /api/wishlist              → addToWishlist(productId)
//   DELETE /api/wishlist/:productId   → removeFromWishlist(productId)
//
// For guest users: state lives in WishlistContext (localStorage).
// For logged-in users: sync to backend on login (merge local + server).
// ============================================================

import { simulateDelay } from "./apiClient";

export async function syncWishlist(items) {
  await simulateDelay(300);
  // Future: POST /api/wishlist/sync with { productIds: [...] }
  return { success: true };
}
