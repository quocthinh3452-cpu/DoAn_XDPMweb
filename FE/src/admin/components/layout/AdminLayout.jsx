import { cn } from "../../../utils/cn";
import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useUser }  from "../../../context/UserContext";
import { useToast } from "../../../context/ToastContext";

const NAV = [
  { path:"/admin",          label:"Dashboard", icon:"▦",  exact:true },
  { path:"/admin/orders",   label:"Orders",    icon:"📦" },
  { path:"/admin/products", label:"Products",  icon:"📱" },
  { path:"/admin/users",    label:"Users",     icon:"👥" },
];

export default function AdminLayout() {
  const { user, logout }   = useUser();
  const { success }        = useToast();
  const { pathname }       = useLocation();
  const navigate           = useNavigate();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => item.exact ? pathname===item.path : pathname.startsWith(item.path);
  const handleLogout = async () => { await logout(); success("Signed out","See you!"); navigate("/"); };
  const W = collapsed ? "w-[68px]" : "w-[240px]";

  const NavItem = ({ item, mobile=false }) => {
    const active = isActive(item);
    return (
      <Link to={item.path}
        title={collapsed&&!mobile ? item.label : ""}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
          active
            ? "bg-accent/12 text-[var(--color-accent-hl)] font-semibold"
            : "text-muted hover:text-text2 hover:bg-surface3"
        )}>
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-gradient-to-b from-accent-hl to-accent rounded-full" />}
        <span className={`text-md shrink-0 ${collapsed&&!mobile ? "mx-auto" : ""} ${active ? "" : "opacity-70"}`}>{item.icon}</span>
        {(!collapsed||mobile) && <span className="flex-1">{item.label}</span>}
        {(!collapsed||mobile) && active && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-hl shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {mobileOpen && <div className="fixed inset-0 bg-black/65 z-[99] lg:hidden backdrop-blur-sm" onClick={()=>setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen flex flex-col z-[100]",
        "bg-gradient-to-b from-surface to-surface2",
        "border-r border-border",
        "shadow-[4px_0_24px_rgba(0,0,0,0.3)]",
        "transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        W,
        "max-lg:w-[240px]",
        mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
        "max-lg:transition-transform"
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-[65px] border-b border-border shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-[var(--color-accent-dim)] flex items-center justify-center text-sm text-white shadow-[0_2px_8px_rgba(108,95,255,0.4)] shrink-0">⚡</div>
            {!collapsed && <span className="font-display text-lg2 font-extrabold tracking-tight text-text">TechStore</span>}
          </Link>
          <button onClick={()=>setCollapsed(v=>!v)}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-lg border border-border text-muted text-sm hover:border-border2 hover:text-text2 transition-all shrink-0">
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && <p className="text-3xs font-bold uppercase tracking-[0.15em] text-muted font-display px-3 pb-2 pt-1">Navigation</p>}
          {NAV.map(item => <NavItem key={item.path} item={item} />)}
        </nav>

        {/* Footer */}
        <div className="px-2.5 py-3 border-t border-border flex flex-col gap-1 shrink-0">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-text2 hover:bg-surface3 transition-all ${collapsed ? "" : ""}`}>
            <span className={`text-md shrink-0 opacity-70 ${collapsed ? "mx-auto" : ""}`}>🏪</span>
            {!collapsed && <span>Back to Store</span>}
          </Link>

          {user && (
            <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface3 transition-colors overflow-hidden ${collapsed ? "justify-center" : ""}`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-[var(--color-accent-dim)] text-white font-display font-bold text-sm2 flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(108,95,255,0.35)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm2 font-semibold text-text2 truncate">{user.name}</p>
                    <p className="text-2xs text-[var(--color-accent-hl)] font-semibold font-display">Admin</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-6 h-6 flex items-center justify-center rounded-lg border border-border text-muted hover:border-red/30 hover:text-red transition-all shrink-0">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col min-h-screen transition-[margin-left] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-50 h-[65px] bg-bg/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-7 gap-4">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-surface2 transition-colors" onClick={()=>setMobileOpen(true)}>
            {[0,1,2].map(i=><span key={i} className="block w-[17px] h-[1.5px] bg-text rounded-full mb-1 last:mb-0" />)}
          </button>
          <p className="font-display text-lg2 font-bold text-text">
            {NAV.find(i=>isActive(i))?.label ?? "Admin"}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:inline-flex text-2xs font-bold font-display uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-accent/10 text-[var(--color-accent-hl)] border border-accent/20">
              Admin Panel
            </span>
            <Link to="/" className="text-sm font-medium text-muted hover:text-text2 transition-colors">
              View Store →
            </Link>
          </div>
        </header>

        <div className="flex-1 p-7 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
