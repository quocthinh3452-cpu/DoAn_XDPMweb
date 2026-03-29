/**
 * NotificationBell.jsx
 * Bell icon + animated dropdown list.
 * Đọc từ NotificationContext.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { useNotifications } from "../../../context/NotificationContext";

const TYPE_ICONS = {
  order: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  sale: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  promo: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const TYPE_COLORS = {
  order: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" },
  sale:  { bg: "rgba(240,98,146,0.12)", color: "#f06292" },
  promo: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
};

const CLOSE_DELAY = 150;

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();
  const [open, setOpen]   = useState(false);
  const timer             = useRef(null);
  const btnRef            = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleOpen  = useCallback(() => { clearTimeout(timer.current); setOpen(true);  }, []);
  const handleClose = useCallback(() => { timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY); }, []);

  const handleToggle = () => setOpen((v) => !v);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-lg text-muted hover:border-accent hover:text-accent transition-all duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs font-bold min-w-5 h-5 rounded-full flex items-center justify-center px-1"
            aria-hidden
            style={{ animation: "popIn 300ms cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Shake animation when new unread arrives */}
        <style>{`
          @keyframes bellShake {
            0%,100% { transform: rotate(0); }
            15% { transform: rotate(12deg); }
            30% { transform: rotate(-10deg); }
            45% { transform: rotate(8deg); }
            60% { transform: rotate(-6deg); }
            75% { transform: rotate(4deg); }
          }
          @keyframes notifDropIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
        `}</style>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Thông báo"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 340,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset",
            zIndex: 300,
            overflow: "hidden",
            animation: "notifDropIn 200ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              Thông báo
              {unreadCount > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, background: "var(--color-accent)", color: "#fff", borderRadius: 99, padding: "1px 6px", fontWeight: 700 }}>
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4 }}
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-muted)", fontSize: 13 }}>
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((n) => {
                const typeColor = TYPE_COLORS[n.type] ?? TYPE_COLORS.promo;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "11px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--color-border)",
                      background: n.read ? "transparent" : "rgba(124,111,247,0.04)",
                      transition: "background 150ms",
                      position: "relative",
                    }}
                  >
                    {/* Icon */}
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: typeColor.bg, color: typeColor.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {TYPE_ICONS[n.type]}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-text)", marginBottom: 2 }}>
                        {n.title}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 4, opacity: 0.6 }}>
                        {n.time}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0, marginTop: 6 }} />
                    )}

                    {/* Dismiss */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      aria-label="Xoá thông báo"
                      style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", borderRadius: 4, opacity: 0, transition: "opacity 150ms" }}
                      className="notif-dismiss"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>

                    <style>{`.notif-dismiss { opacity: 0; } div:hover > .notif-dismiss { opacity: 1; }`}</style>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
