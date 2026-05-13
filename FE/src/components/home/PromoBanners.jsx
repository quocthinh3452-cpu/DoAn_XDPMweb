import { Link } from "react-router-dom";

export default function PromoBanners({ banners }) {
  return (
    <section className="container-page">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {banners.map((b) => (
          <Link
            key={b.id}
            to={b.link}
            className="
              card-raised group
              relative flex items-center gap-5
              px-6 py-5 overflow-hidden
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-[color:var(--color-accent)]
            "
            style={{
              // Border accent tint on hover handled via CSS var trick below
              transition: "border-color 220ms ease, box-shadow 220ms ease, transform 260ms cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${b.accentColor}44`;
              e.currentTarget.style.boxShadow   = `0 16px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${b.accentColor}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow   = "";
            }}
          >
            {/* ── Ambient glow — small element + scale, no blur repaint ── */}
            <div
              aria-hidden
              className="absolute -top-6 -left-6 w-20 h-20 rounded-full pointer-events-none"
              style={{
                background:      b.accentColor,
                filter:          "blur(10px)",   // cheap: small element
                transform:       "scale(3)",      // GPU scale, free
                transformOrigin: "top left",
                opacity:         0.07,
                transition:      "opacity 220ms ease",
              }}
            />
            {/* Hover: glow brightens — DOM direct, no re-render */}
            <div
              aria-hidden
              className="absolute -top-6 -left-6 w-20 h-20 rounded-full pointer-events-none opacity-0 group-hover:opacity-100"
              style={{
                background:      b.accentColor,
                filter:          "blur(10px)",
                transform:       "scale(3)",
                transformOrigin: "top left",
                opacity:         0,
                transition:      "opacity 220ms ease",
              }}
            />

            {/* ── Icon container ── */}
            <div
              className="relative shrink-0 z-10 flex items-center justify-center rounded-xl"
              style={{
                width:      48,
                height:     48,
                background: `${b.accentColor}18`,
                border:     `1px solid ${b.accentColor}28`,
                fontSize:   22,
                transition: "background 220ms ease, border-color 220ms ease, transform 260ms cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              {b.icon}
            </div>

            {/* ── Text ── */}
            <div className="flex-1 min-w-0 z-10">
              {/* Label — eyebrow */}
              <span
                className="block font-display font-bold uppercase mb-1"
                style={{
                  fontSize:      10,
                  letterSpacing: "0.12em",
                  color:         b.accentColor,
                }}
              >
                {b.label}
              </span>

              {/* Title */}
              <p
                className="font-display font-bold truncate"
                style={{
                  fontSize:      15,
                  lineHeight:    1.25,
                  color:         "var(--color-text)",
                }}
              >
                {b.title}
              </p>

              {/* Subtitle */}
              <p
                className="truncate mt-1"
                style={{
                  fontSize:   13,
                  lineHeight: 1.4,
                  color:      "var(--color-muted)",
                }}
              >
                {b.subtitle}
              </p>
            </div>

            {/* ── Arrow ── */}
            <div
              className="shrink-0 z-10 flex items-center justify-center rounded-full"
              style={{
                width:      32,
                height:     32,
                background: `${b.accentColor}14`,
                border:     `1px solid ${b.accentColor}22`,
                color:      b.accentColor,
                transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1), background 220ms ease, border-color 220ms ease",
              }}
            >
              <svg
                className="group-hover:translate-x-0.5 transition-transform duration-200"
                width="14" height="14"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}