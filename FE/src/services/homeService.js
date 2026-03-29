// ============================================================
// HOME SERVICE
// ============================================================
// Future Laravel endpoint:
//   GET /api/home  →  { slides, promos, brands, featured, newArrivals }
//
// Laravel tip: Create a HomeController@index that aggregates
// all homepage data in a single request to minimize round trips.
// ============================================================

import { simulateDelay } from "./apiClient";
import { HERO_SLIDES, PROMO_BANNERS, BRANDS, WHY_US } from "../data/home";
import { PRODUCTS } from "../data/products";

/**
 * GET /api/home
 * Returns all data needed to render the homepage
 */
export async function getHomeData() {
  await simulateDelay(350);

  return {
    data: {
      slides:      HERO_SLIDES,
      promos:      PROMO_BANNERS,
      brands:      BRANDS,
      whyUs:       WHY_US,
      featured:    PRODUCTS.filter((p) => p.isFeatured).slice(0, 4),
      newArrivals: PRODUCTS.filter((p) => p.isNew).slice(0, 4),
      topRated:    [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4),
      deals:       PRODUCTS.filter((p) => p.originalPrice > p.price).slice(0, 4),
    },
  };
}
