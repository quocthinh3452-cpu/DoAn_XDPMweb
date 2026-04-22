import { cn } from "../../../utils/cn";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useUser }  from "../../../context/UserContext";
import { useToast } from "../../../context/ToastContext";
import { AdminErrorBoundary } from "../ui/AdminUI";

const NAV = [
  { path: "/admin/dashboard",          label: "Dashboard", icon: "▦",  exact: true },
  { path: "/admin/orders",   label: "Orders",    icon: "📦"               },
  { path: "/admin/products", label: "Products",  icon: "📱"               },
  { path: "/admin/users",    label: "Users",     icon: "👥"               },
];

export default function AdminLayout() {
  const { user, logout } = useUser();
  const { success }      = useToast();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive  = (item) => item.exact ? pathname === item.path : pathname.startsWith(item.path);
  const activeNav = NAV.find((i) => isActive(i));

  // [ key → toggle sidebar
  useEffect(() => {
    const h = (e) => { if (e.key === "[" && !e.target.matches("input, textarea, select")) setCollapsed((v) => !v); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => { await logout(); success("Signed out", "See you soon!"); navigate("/"); };
  const W = collapsed ? "w-[72px]" : "w-[256px]";

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/65 z-[99] lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen flex flex-col z-[100]",
        "bg-gradient-to-b from-surface to-surface2 border-r border-border",
        "shadow-[4px_0_40px_rgba(0,0,0,0.25)]",
        "transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        W,
        "max-lg:w-[256px]",
        mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
        "max-lg:transition-transform"
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-[68px] border-b border-border shrink-0">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-[var(--color-accent-dim)] flex items-center justify-center text-base text-white shadow-[0_2px_14px_rgba(108,95,255,0.5)] shrink-0">⚡</div>
            {!collapsed && <span className="font-display text-xl font-extrabold tracking-tight text-text truncate">TechStore</span>}
          </Link>
          <button onClick={() => setCollapsed((v) => !v)} title="Toggle sidebar  [ ]"
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg border border-border text-muted text-sm hover:border-border2 hover:text-text hover:bg-surface3 transition-all shrink-0">
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/40 font-display px-3 pb-3 pt-1">Menu</p>
          )}
          {NAV.map((item) => {
            const active = isActive(item);
            const show   = !collapsed;
            return (
              <Link key={item.path} to={item.path} title={collapsed ? item.label : ""}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group",
                  active
                    ? "bg-accent/12 text-[var(--color-accent-hl)] font-semibold"
                    : "text-muted hover:text-text2 hover:bg-surface3"
                )}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-gradient-to-b from-accent-hl to-accent rounded-r-full" />
                )}
                <span className={cn(
                  "text-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                  !show && "mx-auto",
                  !active && "opacity-70"
                )}>{item.icon}</span>
                {show && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 animate-pulse" />}
                  </>
                )}
              </Link>
            );
          })}

          {!collapsed && (
            <>
              <div className="my-3 border-t border-border/50" />
              <div className="px-3 py-1">
                <p className="text-[10px] text-muted/35 font-display leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 bg-surface3 border border-border rounded text-[10px] font-mono">&#91;</kbd> to collapse
                </p>
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-border flex flex-col gap-1 shrink-0">
          <Link to="/" className={cn("flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium text-muted hover:text-text2 hover:bg-surface3 transition-all")}>
            <span className={cn("text-[18px] shrink-0 opacity-70", collapsed && "mx-auto")}>🏪</span>
            {!collapsed && <span>Back to Store</span>}
          </Link>

          {user && (
            <div className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-surface3 transition-colors overflow-hidden",
              collapsed && "justify-center"
            )}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-[var(--color-accent-dim)] text-white font-display font-bold text-sm flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(108,95,255,0.4)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text2 truncate">{user.name}</p>
                    <p className="text-xs text-[var(--color-accent-hl)] font-semibold font-display">Admin</p>
                  </div>
                  <button onClick={handleLogout} title="Sign out"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:border-red/40 hover:text-red hover:bg-red/5 transition-all shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-[margin-left] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "lg:ml-[72px]" : "lg:ml-[256px]"
      )}>

        {/* Topbar */}
        <header className="sticky top-0 z-50 h-[68px] bg-bg/90 backdrop-blur-xl border-b border-border flex items-center gap-4 px-6 shadow-sm">
          {/* Hamburger */}
          <button className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-surface2 transition-colors" onClick={() => setMobileOpen(true)}>
            <span className="block w-[18px] h-[1.5px] bg-text rounded-full mb-[5px]" />
            <span className="block w-[14px] h-[1.5px] bg-text rounded-full mb-[5px]" />
            <span className="block w-[18px] h-[1.5px] bg-text rounded-full" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <span className="text-muted font-medium hidden sm:block">Admin</span>
            {activeNav && (
              <>
                <span className="text-muted/40 hidden sm:block">/</span>
                <span className="font-display font-bold text-text">{activeNav.label}</span>
              </>
            )}
          </nav>

          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-xs font-bold font-display uppercase tracking-[0.1em] px-3 py-1.5 rounded-full bg-accent/10 text-[var(--color-accent-hl)] border border-accent/20">
              Admin Panel
            </span>
            <Link to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text transition-colors px-3.5 py-2 rounded-xl hover:bg-surface2 border border-transparent hover:border-border">
              Store
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </header>

        {/* Content */}
      <main className="flex-1 min-w-0 p-6 lg:p-9 max-w-[1480px] w-full mx-auto">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>   
      </div>
    </div>
  );
}
