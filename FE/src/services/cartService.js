// ============================================================
// CART SERVICE
// ============================================================
// Defined endpoints (to be implemented in Laravel):
//   GET    /api/cart                   → getCart()
//   POST   /api/cart/items             → addToCart(item)
//   PATCH  /api/cart/items/:id         → updateCartItem(id, qty)
//   DELETE /api/cart/items/:id         → removeFromCart(id)
//   DELETE /api/cart                   → clearCart()
//
// Currently: cart state is managed client-side via CartContext.
// When backend is ready: replace context logic with these API calls.
// ============================================================

import { simulateDelay } from "./apiClient";

/**
 * POST /api/cart/items
 * Add a product to the cart
 */
export async function addToCart(payload) {
  await simulateDelay(200);
  // Future: return apiPost("/cart/items", payload)
  return { success: true, data: payload };
}

/**
 * PATCH /api/cart/items/:id
 * Update quantity of a cart item
 */
export async function updateCartItem(id, quantity) {
  await simulateDelay(200);
  return { success: true, data: { id, quantity } };
}

/**
 * DELETE /api/cart/items/:id
 * Remove an item from cart
 */
export async function removeFromCart(id) {
  await simulateDelay(200);
  return { success: true };
}
