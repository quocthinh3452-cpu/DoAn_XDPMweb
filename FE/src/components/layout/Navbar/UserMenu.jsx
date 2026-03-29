/**
 * UserMenu.jsx
 *
 * Avatar + dropdown tài khoản – phiên bản nâng cấp UI/UX.
 * - Glassmorphism panel với backdrop-blur
 * - Avatar gradient động theo tên user
 * - Staggered item animation (CSS keyframes)
 * - Active indicator + icon cho từng menu item
 * - Ripple effect khi click avatar
 * - Smooth open/close transition
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useLocation }            from "react-router-dom";
import { useUser }  from "../../../context/UserContext";
import { useToast } from "../../../context/ToastContext";

/* ─── Icons (inline SVG để tránh thêm dependency) ─────────────────── */
const IconUser    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IconBox     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconShield  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconLogout  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconChevron = ({ open }) => (
  <svg
    width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 200ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ─── Tạo gradient màu từ tên user ─────────────────────────────────── */
const AVATAR_GRADIENTS = [
  ["#7c6ff7", "#c084fc"],
  ["#f97316", "#fb923c"],
  ["#06b6d4", "#22d3ee"],
  ["#10b981", "#34d399"],
  ["#f43f5e", "#fb7185"],
  ["#8b5cf6", "#a78bfa"],
];
function getGradient(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

/* ─── Menu items config ─────────────────────────────────────────────── */
const MENU_ITEMS = [
  { to: "/profile", label: "Trang cá nhân", Icon: IconUser   },
  { to: "/orders",  label: "Đơn hàng",      Icon: IconBox    },
  { to: "/admin",   label: "Admin",          Icon: IconShield, accent: true },
];

/* ─── CSS (inject một lần) ──────────────────────────────────────────── */
const STYLE_ID = "user-menu-styles";
const CSS = `
@keyframes umDropIn {
  from { opacity:0; transform:translateY(-8px) scale(0.97); }
  to   { opacity:1; transform:translateY(0)    scale(1);    }
}
@keyframes umItemIn {
  from { opacity:0; transform:translateX(-6px); }
  to   { opacity:1; transform:translateX(0);    }
}
@keyframes umRipple {
  from { transform:scale(0); opacity:0.6; }
  to   { transform:scale(2.4); opacity:0; }
}
@keyframes umPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(124,111,247,0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(124,111,247,0);  }
}

.um-panel {
  animation: umDropIn 180ms cubic-bezier(0.16,1,0.3,1) forwards;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transform-origin: top right;
}
.um-item {
  opacity: 0;
  animation: umItemIn 200ms cubic-bezier(0.16,1,0.3,1) forwards;
}
.um-item:nth-child(1) { animation-delay: 40ms;  }
.um-item:nth-child(2) { animation-delay: 80ms;  }
.um-item:nth-child(3) { animation-delay: 120ms; }
.um-item:nth-child(4) { animation-delay: 160ms; }

.um-avatar-btn {
  position: relative;
  overflow: hidden;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.um-avatar-btn:hover  { transform: scale(1.08); }
.um-avatar-btn:active { transform: scale(0.96); }
.um-avatar-btn.um-open { animation: umPulse 1.4s ease infinite; }

.um-ripple {
  position: absolute;
  border-radius: 50%;
  width: 100%; height: 100%;
  background: rgba(255,255,255,0.35);
  pointer-events: none;
  animation: umRipple 500ms ease-out forwards;
}

.um-link {
  position: relative;
  transition: background 150ms ease, color 150ms ease, padding-left 150ms ease;
}
.um-link::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px; height: 60%;
  border-radius: 0 2px 2px 0;
  background: var(--um-accent, #7c6ff7);
  transition: transform 150ms ease;
}
.um-link:hover::before, .um-link.um-active::before { transform: translateY(-50%) scaleY(1); }
.um-link:hover, .um-link.um-active { padding-left: 18px !important; }

.um-logout-btn {
  transition: background 150ms ease, color 150ms ease;
  position: relative;
  overflow: hidden;
}
.um-logout-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(248,113,113,0.08);
  opacity: 0;
  transition: opacity 150ms ease;
}
.um-logout-btn:hover::after { opacity: 1; }

.um-status-dot {
  position: absolute;
  bottom: 0; right: 0;
  width: 10px; height: 10px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid var(--um-surface, #1a1a2e);
  animation: umPulse 2s ease infinite;
}
.um-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  margin: 8px 0;
}
.um-link, .um-logout-btn {
  min-height: 44px;
}
`;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─── Component ─────────────────────────────────────────────────────── */
export function UserMenu() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useUser();
  const { success }      = useToast();

  const [open, setOpen]    = useState(false);
  const [ripple, setRipple] = useState(false);
  const timer = useRef(null);

  useEffect(() => { injectStyles(); }, []);
  // Đóng khi navigate
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleOpen  = () => { clearTimeout(timer.current); setOpen(true);  };
  const handleClose = () => { timer.current = setTimeout(() => setOpen(false), 180); };

  const handleAvatarClick = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 500);
    setOpen(v => !v);
  };

  const handleLogout = useCallback(async () => {
    await logout();
    success("Đã đăng xuất", "Hẹn gặp lại!");
    navigate("/");
    setOpen(false);
  }, [logout, success, navigate]);

  const [g1, g2] = getGradient(user?.name);
  const initial  = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      {/* ── Avatar button ── */}
      <button
        aria-label={`Tài khoản ${user?.name}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleAvatarClick}
        className={`um-avatar-btn w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center text-white select-none ${open ? "um-open" : ""}`}
        style={{
          background: `linear-gradient(135deg, ${g1}, ${g2})`,
          boxShadow: open
            ? `0 0 0 2px ${g1}55, 0 4px 20px ${g1}44`
            : `0 2px 8px ${g1}33`,
        }}
      >
        {initial}
        {ripple && <span className="um-ripple" />}
        <span className="um-status-dot" style={{ borderColor: "#111827" }} />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="um-panel absolute top-[calc(100%+12px)] right-0 min-w-[256px] rounded-2xl p-2 z-[300]"
          style={{
            background: "rgba(18,18,30,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          role="menu"
        >
          {/* User info header */}
          <div className="px-3.5 py-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-white truncate leading-tight">
                {user?.name}
              </div>
              <div className="text-xs text-white/40 truncate leading-tight mt-0.5">
                {user?.email}
              </div>
            </div>
          </div>

          <div className="um-divider" />

          {/* Menu items */}
          <div className="py-0.5">
            {MENU_ITEMS.map(({ to, label, Icon, accent }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`um-item um-link flex items-center gap-3 px-3.5 py-2.5 text-[15px] rounded-xl mx-0.5 ${
                    accent
                      ? "text-violet-400"
                      : isActive
                      ? "text-white"
                      : "text-white/65 hover:text-white"
                  } ${isActive ? "um-active bg-white/[0.06]" : "hover:bg-white/[0.06]"}`}
                  style={{ "--um-accent": accent ? "#a78bfa" : g1 }}
                >
                  <span
                    className="flex-shrink-0 opacity-70"
                    style={{ color: accent ? "#a78bfa" : isActive ? g1 : "currentColor" }}
                  >
                    <Icon />
                  </span>
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: g1 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="um-divider" />

          {/* Logout */}
          <div className="py-0.5">
            <button
              role="menuitem"
              onClick={handleLogout}
              className="um-item um-logout-btn flex items-center gap-3 px-3.5 py-2.5 text-[15px] text-red-400/80 hover:text-red-400 rounded-xl mx-0.5 w-[calc(100%-4px)] text-left"
            >
              <span className="flex-shrink-0"><IconLogout /></span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}