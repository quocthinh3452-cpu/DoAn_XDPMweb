import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./NotFoundPage.css";

/* ─── Constants ───────────────────────────────────────────── */
const REDIRECT_DELAY = 10;

const ERROR_PRESETS = {
  404: { title: "Page not found",      description: "The page you're looking for doesn't exist,\nwas moved, or never existed at all." },
  403: { title: "Access denied",       description: "You don't have permission to view this page." },
  500: { title: "Server error",        description: "Something went wrong on our end. Please try again later." },
  503: { title: "Service unavailable", description: "We're down for maintenance. Check back soon." },
};

/* ─── Background ──────────────────────────────────────────── */
function ErrorBackground({ codeStr, mousePos }) {
  const parallax = (depth = 1) => ({
    transform: `translate(${(mousePos.x - 0.5) * depth * 20}px, ${(mousePos.y - 0.5) * depth * 12}px)`,
    transition: "transform 0.15s ease-out",
  });

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Orbs */}
      <div
        className="nf-orb1 absolute rounded-full"
        style={{
          width: "clamp(320px,45vw,600px)", height: "clamp(320px,45vw,600px)",
          top: "-10%", left: "-8%",
          background: "radial-gradient(circle, var(--color-accent,#6c63ff) 0%, transparent 70%)",
          filter: "blur(60px)", opacity: .18,
        }}
      />
      <div
        className="nf-orb2 absolute rounded-full"
        style={{
          width: "clamp(280px,40vw,520px)", height: "clamp(280px,40vw,520px)",
          bottom: "-12%", right: "-6%",
          background: "radial-gradient(circle, var(--color-accent2,#ec4899) 0%, transparent 70%)",
          filter: "blur(60px)", opacity: .13,
        }}
      />

      {/* Noise */}
      <div
        className="nf-noise absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
          mixBlendMode: "overlay",
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(transparent calc(100% - 1px), rgba(255,255,255,.03) 100%)",
          backgroundSize: "100% 48px",
        }}
      />

      {/* Scanline sweep */}
      <div
        className="absolute left-0 right-0 h-[120px] pointer-events-none"
        style={{
          background: "linear-gradient(transparent, rgba(108,99,255,.04), transparent)",
          animation: "scanline 8s linear infinite",
        }}
      />

      {/* Ghost digits */}
      {[...Array.from(codeStr), ...Array.from(codeStr)].map((d, i) => (
        <span
          key={i}
          className="absolute font-display font-extrabold select-none"
          style={{
            fontSize: "clamp(90px,14vw,180px)",
            color: "rgba(108,99,255,.04)",
            ...parallax(0.3 + i * 0.15),
            ...[
              { top: "8%",  left: "3%" },
              { top: "18%", left: "28%" },
              { top: "4%",  right: "8%" },
              { bottom: "14%", left: "8%" },
              { bottom: "18%", right: "18%" },
              { bottom: "4%",  right: "3%" },
            ][i % 6],
          }}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

/* ─── Glitch number ───────────────────────────────────────── */
function GlitchCode({ codeStr }) {
  return (
    <div className="nf-fu1 mb-6 select-none">
      <div className="nf-flicker relative inline-block nf-scanline-fx">
        <span
          className="relative inline-block font-display font-extrabold leading-none"
          style={{ fontSize: "clamp(110px,20vw,160px)", color: "var(--color-text)", letterSpacing: "-6px" }}
        >
          {codeStr}
          <span
            className="nf-glitch-1 absolute inset-0 font-display font-extrabold leading-none"
            style={{ fontSize: "clamp(110px,20vw,160px)", letterSpacing: "-6px", color: "var(--color-accent,#6c63ff)", mixBlendMode: "screen" }}
            aria-hidden="true"
          >
            {codeStr}
          </span>
          <span
            className="nf-glitch-2 absolute inset-0 font-display font-extrabold leading-none"
            style={{ fontSize: "clamp(110px,20vw,160px)", letterSpacing: "-6px", color: "var(--color-accent2,#ec4899)", mixBlendMode: "screen" }}
            aria-hidden="true"
          >
            {codeStr}
          </span>
        </span>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function NotFoundPage({ code = 404, title, description }) {
  const preset       = ERROR_PRESETS[code] ?? { title: "Unexpected error", description: "An unexpected error occurred." };
  const displayTitle = title       ?? preset.title;
  const displayDesc  = description ?? preset.description;
  const codeStr      = String(code);

  const navigate              = useNavigate();
  const timerRef              = useRef(null);
  const barRef                = useRef(null);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const [cancelled, setCancelled] = useState(false);
  const [mousePos,  setMousePos]  = useState({ x: 0.5, y: 0.5 });

  /* Countdown */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [navigate]);

  /* Parallax */
  useEffect(() => {
    const handler = (e) =>
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const cancelRedirect = () => {
    clearInterval(timerRef.current);
    setCancelled(true);
    if (barRef.current) barRef.current.style.animationPlayState = "paused";
  };

  const parallax = (depth = 1) => ({
    transform: `translate(${(mousePos.x - 0.5) * depth * 20}px, ${(mousePos.y - 0.5) * depth * 12}px)`,
    transition: "transform 0.15s ease-out",
  });

  return (
    <div
      className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 relative overflow-hidden"
      aria-label={`Error ${codeStr}: ${displayTitle}`}
    >
      <ErrorBackground codeStr={codeStr} mousePos={mousePos} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center" style={parallax(0.08)}>

        <GlitchCode codeStr={codeStr} />

        {/* Title + description */}
        <div className="nf-fu2 text-center mb-8">
          <h1 className="font-display text-2xl font-extrabold mb-2" style={{ color: "var(--color-text)" }}>
            {displayTitle}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)", whiteSpace: "pre-line" }}>
            {displayDesc}
          </p>
        </div>

        {/* Buttons */}
        <div className="nf-fu3 flex items-center justify-center gap-3 flex-wrap mb-6">
          <button
            className="nf-btn nf-btn-ghost"
            onClick={() => { cancelRedirect(); navigate(-1); }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go back
          </button>
          <Link to="/" className="nf-btn nf-btn-primary" onClick={cancelRedirect}>
            Back to homepage
          </Link>
        </div>

        {/* Countdown */}
        {!cancelled && (
          <div className="nf-fu4 w-full">
            <p className="text-xs text-center mb-2" style={{ color: "var(--color-text-muted)" }}>
              Redirecting to homepage in{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 600 }}>{countdown}s</span>
              {" — "}
              <button
                onClick={cancelRedirect}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  color: "var(--color-accent,#6c63ff)", fontWeight: 600, fontSize: "inherit",
                }}
              >
                cancel
              </button>
            </p>
            <div className="nf-countdown-track">
              <div
                ref={barRef}
                className="nf-countdown-bar"
                style={{ animationDuration: `${REDIRECT_DELAY}s` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
