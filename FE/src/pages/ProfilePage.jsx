import { useState } from "react";
import { useUser } from "../context/UserContext";
import { TabInfo, TabAddress, TabPassword, TabOrders } from "./ProfileTabs";

/* ─── SVG icons ───────────────────────────────────────── */
const Icons = {
  user: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="2.5"/>
      <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5"/>
    </svg>
  ),
  mapPin: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3.5-4.5 8.5-4.5 8.5S3.5 9.5 3.5 6A4.5 4.5 0 0 1 8 1.5z"/>
      <circle cx="8" cy="6" r="1.5"/>
    </svg>
  ),
  lock: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7.5" width="10" height="7" rx="1.5"/>
      <path d="M5 7.5V5a3 3 0 0 1 6 0v2.5"/>
    </svg>
  ),
  box: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 4.5l-5.5 3-5.5-3"/>
      <path d="M8 7.5V14"/>
      <path d="M2 4.5l6-3 6 3v7l-6 3-6-3V4.5z"/>
    </svg>
  ),
  signOut: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>
      <path d="M11 11l3-3-3-3"/>
      <path d="M14 8H6"/>
    </svg>
  ),
  chevronRight: (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5"/>
    </svg>
  ),
};

const TABS = [
  { id: "info",     label: "Personal Info", icon: Icons.user,   Component: TabInfo,     desc: "Name & contact"   },
  { id: "address",  label: "Address",       icon: Icons.mapPin, Component: TabAddress,  desc: "Delivery info"    },
  { id: "password", label: "Password",      icon: Icons.lock,   Component: TabPassword, desc: "Security"         },
  { id: "orders",   label: "Orders",        icon: Icons.box,    Component: TabOrders,   desc: "Purchase history" },
];

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div className="relative shrink-0">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center
                   font-display text-[20px] font-bold text-white"
        style={{
          background: "linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 55%, #a78bfa))",
          boxShadow: "0 4px 20px color-mix(in srgb, var(--color-accent) 30%, transparent)",
        }}
      >
        {initials}
      </div>
      <span
        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface"
        style={{ background: "#22c55e" }}
      />
    </div>
  );
}

function TabButton({ tab, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl w-full text-left",
        "text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-accent/12 text-accent font-semibold"
          : "text-muted hover:bg-surface2/80 hover:text-text",
      ].join(" ")}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent"
          style={{ animation: "scaleIn 0.15s ease both" }}
        />
      )}
      <span className={`shrink-0 transition-opacity ${active ? "opacity-100" : "opacity-40"}`}>
        {tab.icon}
      </span>
      <div className="flex flex-col min-w-0">
        <span className="leading-tight">{tab.label}</span>
        <span className={`text-[10.5px] font-normal leading-tight mt-0.5 ${active ? "text-accent/60" : "text-muted/50"}`}>
          {tab.desc}
        </span>
      </div>
    </button>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("info");
  const [panelKey, setPanelKey]   = useState(0);

  const ActivePanel = TABS.find(t => t.id === activeTab)?.Component;

  const switchTab = (id) => {
    if (id === activeTab) return;
    setActiveTab(id);
    setPanelKey(k => k + 1);
  };

  return (
    <div className="container-page py-10 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name} />
          <div className="min-w-0">
            <p className="font-display text-[20px] font-bold tracking-tight truncate leading-tight">
              {user?.name ?? "My Account"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[12.5px] text-muted truncate">{user?.email}</p>
              {user?.email && (
                <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md
                                 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <span className="text-[10.5px] uppercase tracking-widest font-semibold text-muted/50">Member since</span>
          <span className="text-[13px] font-semibold text-text">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : "2024"}
          </span>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[188px_1fr] gap-5 items-start">

        {/* Sidebar */}
        <nav className="md:sticky md:top-24 bg-surface border border-border rounded-2xl p-2
                        flex md:flex-col flex-row gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => switchTab(tab.id)}
            />
          ))}

          <div className="hidden md:block mt-auto pt-2 border-t border-border">
            <button className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl w-full text-left
                               text-[13px] font-medium text-muted/50 hover:text-red-400
                               hover:bg-red-500/6 transition-all duration-200">
              <span className="shrink-0 opacity-60">{Icons.signOut}</span>
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Panel */}
        <div
          key={panelKey}
          className="bg-surface border border-border rounded-2xl p-6 md:p-8 min-h-[420px]"
          style={{ animation: "fadeUp 0.2s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted/50 mb-5 -mt-1 uppercase tracking-wider font-semibold">
            <span>Account</span>
            <span className="opacity-60">{Icons.chevronRight}</span>
            <span className="text-accent/70">{TABS.find(t => t.id === activeTab)?.label}</span>
          </div>

          {ActivePanel && <ActivePanel />}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: translateY(-50%) scaleY(0); }
          to   { transform: translateY(-50%) scaleY(1); }
        }
      `}</style>
    </div>
  );
}