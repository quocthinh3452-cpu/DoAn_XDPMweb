// ============================================================
// PROFILE SERVICE
// ============================================================
// Future Laravel endpoints:
//   GET    /api/profile           → getProfile()
//   PUT    /api/profile           → updateProfile(payload)
//   PUT    /api/profile/password  → changePassword({ current, new })
// ============================================================

import { simulateDelay } from "./apiClient";

/**
 * PUT /api/profile
 */
export async function updateProfile(payload) {
  await simulateDelay(700);
  // Validate: email must be unique (server-side in real app)
  if (!payload.name?.trim()) throw new Error("Name is required.");
  if (!payload.email?.trim()) throw new Error("Email is required.");
  return { data: payload };
}

/**
 * PUT /api/profile/password
 */
export async function changePassword({ currentPassword, newPassword }) {
  await simulateDelay(800);
  // Mock: only "demo123" is accepted as current password
  if (currentPassword !== "demo123" && currentPassword.length < 4) {
    throw new Error("Current password is incorrect.");
  }
  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }
  return { success: true };
}
