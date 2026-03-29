/**
 * useNavKeyboard.js
 *
 * Xử lý toàn bộ keyboard logic cho Navbar:
 *   - Ctrl/Cmd+K → mở SearchOverlay
 *   - Phím printable bất kỳ (không trong input) → mở SearchOverlay với ký tự đó
 */
import { useEffect } from "react";

/**
 * @param {boolean}  searchOpen      - SearchOverlay đang mở hay không
 * @param {Function} openSearch      - callback(initialChar: string) để mở overlay
 */
export function useNavKeyboard(searchOpen, openSearch) {
  useEffect(() => {
    const fn = (e) => {
      // Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch("");
        return;
      }

      if (searchOpen) return;

      const isEditing =
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) ||
        document.activeElement?.isContentEditable;

      const printable = e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey;

      if (printable && !isEditing) {
        openSearch(e.key);
      }
    };

    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [searchOpen, openSearch]);
}
