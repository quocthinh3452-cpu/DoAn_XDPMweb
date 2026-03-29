/**
 * MobileDrawer.jsx
 *
 * Slide-in drawer từ phải trên mobile.
 * Bao gồm: search shortcut, nav links, danh mục, tài khoản, nút giỏ hàng.
 */
import { useCallback }    from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser }     from "../../../context/UserContext";
import { useToast }    from "../../../context/ToastContext";
import { useCart }     from "../../../context/CartContext";
import { CAT_ICONS, FallbackCatIcon } from "./NavbarIcons";
import { MEGA_CATS }   from "./MegaMenu";

export function MobileDrawer({ open, onClose, onOpenSearch }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const { user, isLoggedIn, logout } = useUser();
  const { success }                  = useToast();
  const { items }                    = useCart();

  const itemCount = items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const handleLogout = useCallback(async () => {
    await logout();
    success("Đã đăng xuất", "Hẹn gặp lại!");
    navigate("/");
    onClose();
  }, [logout, success, navigate, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-[299]"
          onClick={onClose}
          style={{ animation: "tsNavFadeInMenu 200ms ease" }}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-dvh w-[min(320px,85vw)] bg-surface border-l border-border z-[300] flex flex-col transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
            <span className="font-display text-lg font-extrabold text-text">TechStore</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface2 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Search shortcut */}
        <button
          onClick={() => { onClose(); onOpenSearch(); }}
          className="flex items-center gap-2.5 mx-5 my-4 px-3.5 py-2.5 bg-surface2 border border-border rounded-lg shrink-0 text-muted hover:border-accent transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="flex-1 text-left font-body text-sm">Tìm sản phẩm…</span>
        </button>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3 pb-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium text-text hover:bg-surface2 transition-colors"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Trang chủ
          </Link>

          {/* Categories */}
          <p className="text-xs font-bold uppercase tracking-widest text-muted px-3 pt-4 pb-1.5 font-display">Danh mục</p>
          {MEGA_CATS.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              onClick={onClose}
              className="flex items-center gap-2.5 pl-5 pr-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface2 transition-all"
            >
              <span style={{ color: "var(--color-accent)", width: 14, height: 14, display: "flex" }}>
                {CAT_ICONS[cat.id] ?? <FallbackCatIcon />}
              </span>
              {cat.label}
            </Link>
          ))}

          {/* Account */}
          <p className="text-xs font-bold uppercase tracking-widest text-muted px-3 pt-4 pb-1.5 font-display">Tài khoản</p>
          {isLoggedIn ? (
            <>
              <Link to="/orders"  onClick={onClose} className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium text-text hover:bg-surface2 transition-colors">Đơn hàng</Link>
              <Link to="/profile" onClick={onClose} className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium text-text hover:bg-surface2 transition-colors">Trang cá nhân</Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-surface2 transition-colors w-full text-left"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={onClose} className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium text-text hover:bg-surface2 transition-colors">
              Đăng nhập / Đăng ký
            </Link>
          )}
        </nav>

        {/* Cart CTA */}
        <Link
          to="/cart"
          onClick={onClose}
          className="flex items-center justify-center gap-2.5 mx-5 mb-6 py-3.5 btn-primary rounded-lg font-display text-md font-bold shrink-0"
        >
          Xem giỏ hàng
          {itemCount > 0 && (
            <span className="bg-white/25 rounded-full px-2 py-0.5 text-xs font-bold">{itemCount}</span>
          )}
        </Link>
      </div>
    </>
  );
}
