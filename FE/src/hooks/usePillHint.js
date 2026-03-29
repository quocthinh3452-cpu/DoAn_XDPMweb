/**
 * usePillHint.js
 *
 * Rotating placeholder text cho search pill trên desktop.
 * Tự động xoay vòng mỗi 3 giây.
 */
import { useState, useEffect } from "react";

const PILL_HINTS = [
  "Tìm kiếm...",
  "iPhone 15...",
  "MacBook Air...",
  "AirPods Pro...",
  "Samsung S24...",
];

export function usePillHint() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PILL_HINTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return PILL_HINTS[idx];
}
