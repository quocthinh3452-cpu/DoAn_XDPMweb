/**
 * Navbar.jsx — v10
 *
 * Thêm mới:
 *   ✅ ThemeToggle    — Dark / Light / System
 *   ✅ NotificationBell — bell + dropdown
 *   ✅ LocaleToggle   — Ngôn ngữ + Tiền tệ
 *   ✅ MiniCartPreview — hover cart preview
 */
import { useState, useEffect } from "react";
import { Link, useLocation }   from "react-router-dom";

import { useCart }     from "../../../context/CartContext";
import { useUser }     from "../../../context/UserContext";
import { useWishlist } from "../../../context/WishlistContext";

import { MegaMenu }         from "./MegaMenu";
import { UserMenu }         from "./UserMenu";
import { MobileDrawer }     from "./MobileDrawer";
import { SearchOverlay }    from "./SearchOverlay";
import { ThemeToggle }      from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { LocaleToggle }     from "./LocaleToggle";
import { MiniCartPreview }  from "./MiniCartPreview";
import { useNavKeyboard }   from "../../../hooks/useNavKeyboard";
import { usePillHint }      from "../../../hooks/usePillHint";

const DEFAULT_POPULAR = [
  "iPhone 15", "MacBook Air M3", "AirPods Pro",
  "Samsung S24", "iPad Pro", "Sony WH-1000XM5",
];

const NAV_ANIMATIONS = `
  @keyframes tsNavDropIn     { from { opacity:0; transform:translateY(-6px) scale(.98); } to { opacity:1; transform:none; } }
  @keyframes tsNavFadeIn     { from { opacity:0; } to { opacity:1; } }
  @keyframes tsNavFadeOut    { from { opacity:1; } to { opacity:0; } }
  @keyframes tsNavSlideDown  { from { opacity:0; transform:translateX(-50%) translateY(-14px) scale(0.97); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }
  @keyframes tsNavSlideUp    { from { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } to { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.97); } }
  @keyframes tsNavSpin       { to { transform:rotate(360deg); } }
  @keyframes tsNavFadeInMenu { from { opacity:0; } to { opacity:1; } }
  @keyframes tsSkeleton      { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
`;

export default function Navbar({
  products        = [],
  onSearch,
  popularSearches = DEFAULT_POPULAR,
}) {
  const { pathname } = useLocation();

  const { items }                = useCart();
  const { isLoggedIn }           = useUser();
  const { items: wishlistItems } = useWishlist();

  const itemCount = items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const wishCount = wishlistItems?.length ?? 0;

  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchInitial, setSearchInitial] = useState("");
  const [menuOpen,      setMenuOpen]      = useState(false);

  const pillHint = usePillHint();

  const isMac =
    typeof navigator !== "undefined" &&
    (navigator.userAgentData?.platform ?? navigator.platform ?? "").includes("Mac");

  useNavKeyboard(searchOpen, (char) => {
    setSearchInitial(char);
    setSearchOpen(true);
  });

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLink    = "text-sm font-medium text-muted hover:text-text transition-colors duration-200";
  const activeLink = "text-text";

  return (
    <>
      <style>{NAV_ANIMATIONS}</style>

      {/* ── Header bar ── */}
      <header className="fixed top-0 left-0 right-0 z-[200] h-[72px] bg-bg/88 backdrop-blur-[18px] border-b border-border">
        <div className="container-page h-full flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="TechStore">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polygon
                points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                fill="var(--color-accent)" stroke="var(--color-accent)"
                strokeWidth="1" strokeLinejoin="round"
              />
            </svg>
            <span className="font-display text-xl font-extrabold tracking-tight text-text">
              TechStore
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Điều hướng chính">
            <Link
              to="/"
              className={`${navLink} ${pathname === "/" ? activeLink : ""}`}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              Trang chủ
            </Link>

            <MegaMenu isActive={pathname.startsWith("/products")} />

            {isLoggedIn && (
              <Link
                to="/orders"
                className={`${navLink} ${pathname === "/orders" ? activeLink : ""}`}
              >
                Đơn hàng
              </Link>
            )}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">

            {/* Search pill — desktop */}
            <button
              onClick={() => { setSearchInitial(""); setSearchOpen(true); }}
              aria-label="Tìm kiếm"
              className="hidden md:flex items-center gap-2.5 h-10 px-3.5 bg-surface border border-border rounded-lg text-muted hover:border-accent hover:text-accent transition-all duration-200"
              style={{ minWidth: 170 }}
            >
              <svg className="w-[14px] h-[14px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span
                key={pillHint}
                className="font-body text-xs flex-1 text-left"
                style={{ animation: "tsNavFadeIn 400ms ease" }}
              >
                {pillHint}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--color-border)", background: "var(--color-surface2)", borderRadius: 5, padding: "1px 6px", fontSize: 10, color: "var(--color-muted)", fontFamily: "monospace", lineHeight: 1.8 }}>
                {isMac ? "⌘K" : "Ctrl K"}
              </span>
            </button>

            {/* Search icon — mobile */}
            <button
              onClick={() => { setSearchInitial(""); setSearchOpen(true); }}
              aria-label="Tìm kiếm"
              className="md:hidden w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-lg text-muted hover:border-accent hover:text-accent transition-all duration-200"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* ── NEW: Locale toggle (desktop only) ── */}
            {/* <LocaleToggle /> */}

            {/* ── NEW: Theme toggle ── */}
            <ThemeToggle />

            {/* ── NEW: Notification bell (logged in only) ── */}
            {isLoggedIn && <NotificationBell />}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label={`Yêu thích${wishCount > 0 ? ` (${wishCount})` : ""}`}
              className={`relative w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-lg transition-all duration-200 ${pathname === "/wishlist" ? "border-rose-500 text-rose-400" : "text-muted hover:border-rose-500 hover:text-rose-400"}`}
            >
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill={wishCount > 0 ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-xs font-bold min-w-5 h-5 rounded-full flex items-center justify-center px-1" aria-hidden>
                  {wishCount > 99 ? "99+" : wishCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <Link
                to="/auth"
                className={`hidden md:flex text-sm font-semibold font-display px-4 py-2 rounded-lg bg-surface border border-border text-muted transition-all hover:border-accent hover:text-accent ${pathname === "/auth" ? "border-accent text-accent" : ""}`}
              >
                Đăng nhập
              </Link>
            )}

            {/* ── Cart — replaced với MiniCartPreview ── */}
            <MiniCartPreview itemCount={itemCount} pathname={pathname} />

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] bg-surface border border-border rounded-lg hover:border-accent transition-colors"
            >
              {menuOpen
                ? (
                  <svg className="w-4 h-4 text-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                )
                : [0, 1, 2].map(i => (
                  <span key={i} className="block w-[18px] h-[2px] bg-text rounded-full" aria-hidden />
                ))
              }
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <SearchOverlay
        open={searchOpen}
        initialChar={searchInitial}
        products={products}
        onSearch={onSearch}
        popularSearches={popularSearches}
        onClose={() => { setSearchOpen(false); setSearchInitial(""); }}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSearch={() => { setSearchInitial(""); setSearchOpen(true); }}
      />
    </>
  );
}
