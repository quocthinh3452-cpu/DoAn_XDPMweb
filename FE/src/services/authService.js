// ============================================================
// AUTH SERVICE
// ============================================================
// Defined endpoints (to be implemented in Laravel):
//   POST   /api/auth/login            → login(email, password)
//   POST   /api/auth/register         → register(name, email, password)
//   POST   /api/auth/logout           → logout()
//   GET    /api/auth/me               → getMe()
//
// Laravel setup notes:
//   - Use Laravel Sanctum for SPA auth (cookie-based) or
//     Passport for token-based. Recommend Sanctum for this stack.
//   - On login success, Laravel returns { user, token }
//   - Store token in localStorage, attach as Bearer header via apiClient.js
// ============================================================

import { simulateDelay } from "./apiClient";

// ── Mock user database ───────────────────────────────────────
const MOCK_USERS = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "demo@techstore.com",
    password: "demo123",
    phone: "0901234567",
    address: "123 Nguyen Hue",
    city: "Ho Chi Minh City",
  },
];

// ── Helpers ──────────────────────────────────────────────────
const generateToken = () => `mock_token_${Date.now()}_${Math.random().toString(36).slice(2)}`;

/**
 * POST /api/auth/login
 */
export async function login({ email, password }) {
  await simulateDelay(700);

  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) throw new Error("Invalid email or password.");

  const { password: _pw, ...safeUser } = user;
  const token = generateToken();

  return { data: { user: safeUser, token } };
}

/**
 * POST /api/auth/register
 */
export async function register({ name, email, password }) {
  await simulateDelay(800);

  const exists = MOCK_USERS.find((u) => u.email === email);
  if (exists) throw new Error("An account with this email already exists.");

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone: "",
    address: "",
    city: "",
  };

  // In production: Laravel creates the DB record and returns the user
  MOCK_USERS.push({ ...newUser, password });
  const token = generateToken();

  return { data: { user: newUser, token } };
}

/**
 * POST /api/auth/logout
 */
export async function logout() {
  await simulateDelay(200);
  // In production: invalidate Sanctum token via POST /api/auth/logout
  return { success: true };
}

/**
 * GET /api/auth/me
 * Re-hydrate user from stored token
 */
export async function getMe(token) {
  await simulateDelay(300);

  // In production: send token in Authorization header, Laravel returns user
  // For mock: we decode the userId we stored with the token
  const storedUser = localStorage.getItem("techstore_user");
  if (!storedUser) throw new Error("Not authenticated");

  return { data: JSON.parse(storedUser) };
}
