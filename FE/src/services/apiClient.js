// ============================================================
// API CLIENT — Base configuration
// ============================================================
// When Laravel backend is ready:
//   1. Set BASE_URL to your Laravel API URL (e.g. http://localhost:8000/api)
//   2. Replace simulateDelay with real fetch() calls in each service
//   3. Add auth headers (Bearer token from Sanctum/Passport) here
// ============================================================

export const BASE_URL = "/api"; // Future: "http://localhost:8000/api"

// Simulates network latency. Remove when using real API.
export const simulateDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Future: real HTTP client wrapper
// export async function apiGet(endpoint) {
//   const res = await fetch(`${BASE_URL}${endpoint}`, {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   });
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   return res.json();
// }
