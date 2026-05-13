/**
 * ThemeToggle.jsx
 * 3-mode toggle: Dark → Light → System
 * Animated icon transition, tooltip on hover.
 */
import { useTheme } from "../../../context/ThemeContext";

const MODES = ["dark", "light", "system"];

const ICONS = {
  dark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  light: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  system: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
};

const LABELS = { dark: "Tối", light: "Sáng", system: "Hệ thống" };

export function ThemeToggle() {
  const { mode, setTheme } = useTheme();

  const cycle = () => {
    const idx = MODES.indexOf(mode);
    setTheme(MODES[(idx + 1) % MODES.length]);
  };

  return (
    <div className="relative group">
      <button
        onClick={cycle}
        aria-label={`Chế độ hiển thị: ${LABELS[mode]} — click để đổi`}
        className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-lg text-muted hover:border-accent hover:text-accent transition-all duration-200"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Animated icon swap */}
        <span
          key={mode}
          style={{
            display: "flex",
            animation: "themeIconIn 220ms cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {ICONS[mode]}
        </span>

        <style>{`
          @keyframes themeIconIn {
            from { opacity: 0; transform: scale(0.5) rotate(-30deg); }
            to   { opacity: 1; transform: scale(1)   rotate(0deg);   }
          }
        `}</style>
      </button>

      {/* Tooltip */}
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--color-surface2)",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          padding: "3px 8px",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-muted)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 150ms",
          zIndex: 400,
        }}
        className="group-hover:opacity-100"
      >
        {LABELS[mode]}
      </div>
    </div>
  );
}
