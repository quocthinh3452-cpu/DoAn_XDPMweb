import { cn } from "../utils/cn";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import "./Toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ type = "info", title, message, duration = 3500 }) => {
    const id = `t_${Date.now()}_${Math.random()}`;
    setToasts((p) => [...p.slice(-4), { id, type, title, message }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((title, msg, opts) => toast({ type: "success", title, message: msg, ...opts }), [toast]);
  const error   = useCallback((title, msg, opts) => toast({ type: "error",   title, message: msg, ...opts }), [toast]);
  const info    = useCallback((title, msg, opts) => toast({ type: "info",    title, message: msg, ...opts }), [toast]);
  const cartAdd = useCallback((name) => toast({ type: "cart", title: "Added to cart", message: name, duration: 2500 }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, cartAdd, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 w-[360px] max-w-[calc(100vw-48px)] pointer-events-none">
        {toasts.map((t) => <ToastItem key={t.id} t={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS = {
  success: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  error:   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  info:    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  cart:    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
};

const TYPE_STYLES = {
  success: { bar: "bg-green",  icon: "bg-green/12  text-green",  border: "before:bg-green"  },
  error:   { bar: "bg-red",    icon: "bg-red/12    text-red",    border: "before:bg-red"    },
  info:    { bar: "bg-accent", icon: "bg-accent/12 text-accent", border: "before:bg-accent" },
  cart:    { bar: "bg-accent2",icon: "bg-accent2/12 text-accent2",border: "before:bg-accent2"},
};

function ToastItem({ t, onDismiss }) {
  const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;
  return (
    <div className={cn(
      "toast-enter pointer-events-auto relative flex items-start gap-3 px-4 py-3.5",
      "bg-surface border border-border rounded-xl overflow-hidden",
      "shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
      "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-none",
      s.border
    )} role="alert">
      <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 mt-0.5 ${s.icon}`}>
        {ICONS[t.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-display text-text leading-tight">{t.title}</p>
        {t.message && <p className="text-sm text-muted mt-0.5 truncate">{t.message}</p>}
      </div>
      <button onClick={() => onDismiss(t.id)}
        className="text-muted hover:text-text transition-colors p-0.5 rounded shrink-0">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className={`toast-progress-bar absolute bottom-0 left-0 h-[2px] w-full ${s.bar}`} />
    </div>
  );
}
