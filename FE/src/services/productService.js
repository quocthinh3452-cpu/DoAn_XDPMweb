// ============================================================
// PRODUCT SERVICE
// ============================================================
// Defined endpoints (to be implemented in Laravel):
//   GET    /api/products               → getProducts(filters)
//   GET    /api/products/:id           → getProductById(id)
//   GET    /api/products/featured      → getFeaturedProducts()
//   GET    /api/categories             → getCategories()
//
// To connect to real backend: Replace each function body with
// an apiGet() call to the corresponding endpoint above.
// ============================================================

import { PRODUCTS, CATEGORIES } from "../data/products";
import { simulateDelay } from "./apiClient";

/**
 * GET /api/products
 * Fetches all products with optional filters
 * @param {Object} filters - { category, search, sort, minPrice, maxPrice }
 */
export async function getProducts(filters = {}) {
  await simulateDelay(500);

  let results = [...PRODUCTS];

  // Filter by category
  if (filters.category && filters.category !== "all") {
    results = results.filter((p) => p.category === filters.category);
  }

  // Search by name or brand
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Price range
  if (filters.minPrice != null) {
    results = results.filter((p) => p.price >= filters.minPrice);
  }
  if (filters.maxPrice != null) {
    results = results.filter((p) => p.price <= filters.maxPrice);
  }

  // Sorting
  switch (filters.sort) {
    case "price_asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      break;
  }

  return { data: results, total: results.length };
}

/**
 * GET /api/products/:id
 * Fetches a single product by ID
 * @param {number|string} id
 */
export async function getProductById(id) {
  await simulateDelay(300);

  const product = PRODUCTS.find((p) => p.id === Number(id));
  if (!product) throw new Error("Product not found");

  return { data: product };
}

/**
 * GET /api/products/featured
 * Fetches featured products for the hero section
 */
export async function getFeaturedProducts() {
  await simulateDelay(400);

  const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);
  return { data: featured };
}

/**
 * GET /api/categories
 * Fetches all product categories
 */
export async function getCategories() {
  await simulateDelay(200);
  return { data: CATEGORIES };
}
