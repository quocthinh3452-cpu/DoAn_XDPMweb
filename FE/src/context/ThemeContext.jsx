/**
 * ThemeContext.jsx
 * Light / Dark / System mode — persisted in localStorage.
 * Applies [data-theme="light"] on <html> for CSS variable overrides.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "techstore_theme";
const ThemeContext = createContext(null);

function resolveTheme(mode) {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return mode;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "dark"; }
    catch { return "dark"; }
  });

  const resolved = resolveTheme(mode);

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [resolved]);

  // Re-resolve khi system preference thay đổi
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      if (mq.matches) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setTheme = useCallback((newMode) => {
    setMode(newMode);
    try { localStorage.setItem(STORAGE_KEY, newMode); }
    catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
