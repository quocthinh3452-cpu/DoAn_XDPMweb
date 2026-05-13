/**
 * LocaleContext.jsx
 * Ngôn ngữ (VI/EN) + Tiền tệ (VNĐ/USD) — persisted localStorage.
 */
import { createContext, useContext, useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "techstore_locale";
const LocaleContext = createContext(null);

export const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English",    flag: "🇺🇸" },
];

export const CURRENCIES = [
  { code: "VND", symbol: "₫",  label: "VND",  rate: 1          },
  { code: "USD", symbol: "$",  label: "USD",  rate: 1 / 25000  },
];

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function LocaleProvider({ children }) {
  const [lang, setLangState] = useState(() => readStorage()?.lang || "vi");
  const [currency, setCurrencyState] = useState(() => readStorage()?.currency || "VND");

  const persist = useCallback((l, c) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: l, currency: c })); }
    catch {}
  }, []);

  const setLang = useCallback((code) => {
    setLangState(code);
    persist(code, currency);
  }, [currency, persist]);

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    persist(lang, code);
  }, [lang, persist]);

  /** Format price theo currency hiện tại */
  const formatPrice = useCallback((priceVnd) => {
    const cur = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
    const converted = priceVnd * cur.rate;
    if (currency === "VND") {
      return `${converted.toLocaleString("vi-VN")}${cur.symbol}`;
    }
    return `${cur.symbol}${converted.toFixed(2)}`;
  }, [currency]);

  const value = useMemo(
    () => ({ lang, currency, setLang, setCurrency, formatPrice }),
    [lang, currency, setLang, setCurrency, formatPrice]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within <LocaleProvider>");
  return ctx;
}
