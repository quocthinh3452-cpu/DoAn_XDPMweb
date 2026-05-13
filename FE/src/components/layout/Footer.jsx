/**
 * Footer.jsx — v5
 *
 * Fix so với v4:
 *  - validateEmail() — regex RFC 5322 simplified, client-side
 *  - Validate onBlur (không annoy khi đang gõ) + onChange xoá lỗi ngay
 *  - Validate lần cuối trước submit, focus về input nếu lỗi
 *  - Error message inline bên dưới input (thay browser tooltip)
 *  - aria-invalid + aria-describedby — accessible
 *  - footer__nl-input--invalid — border đỏ khi sai format
 */
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

/* ── Social icons ───────────────────────────────────────────────────────────── */
const SOCIAL = [
  {
    label: "X (Twitter)",
    href: "https://x.com/techstore",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/techstore",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/techstore",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/techstore",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@techstore",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
];

/* ── Payment badges ─────────────────────────────────────────────────────────── */
const PAYMENTS = [
  { label: "Visa",       bg: "#1A1F71", color: "#fff",                          text: "VISA"  },
  { label: "Mastercard", bg: "#EB001B", color: "#fff",                          text: "MC"    },
  { label: "MoMo",       bg: "#A50064", color: "#fff",                          text: "MoMo"  },
  { label: "ZaloPay",    bg: "#0068FF", color: "#fff",                          text: "Zalo"  },
  { label: "COD",        bg: "#22c55e", color: "#fff",                          text: "COD"   },
  { label: "Trả góp",    bg: "rgba(255,255,255,0.06)", color: "var(--color-muted)", text: "0%" },
];

/* ── Nav columns ────────────────────────────────────────────────────────────── */
const NAV_COLS = [
  {
    title: "Danh mục",
    links: [
      { to: "/products?category=smartphone", label: "Smartphones" },
      { to: "/products?category=laptop",     label: "Laptops"     },
      { to: "/products?category=audio",      label: "Audio"       },
      { to: "/products?category=tablet",     label: "Tablets"     },
      { to: "/products?category=wearable",   label: "Wearables"   },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { to: "/auth",     label: "Đăng nhập"        },
      { to: "/auth",     label: "Tạo tài khoản"    },
      { to: "/orders",   label: "Đơn hàng của tôi" },
      { to: "/cart",     label: "Giỏ hàng"          },
      { to: "/wishlist", label: "Yêu thích"         },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      /* Các trang này chưa có route nội bộ → dùng <a> là đúng,
         nhưng để không reload trang khi đã là SPA, nên thêm route sau */
      { to: "/help",    label: "Trung tâm trợ giúp" },
      { to: "/track",   label: "Tra cứu đơn hàng"   },
      { to: "/returns", label: "Đổi trả hàng"        },
      { to: "/contact", label: "Liên hệ"             },
      { to: "/warranty",label: "Bảo hành"            },
    ],
  },
];

/* ── Trust signals (SVG thay emoji) ────────────────────────────────────────── */
const TRUST = [
  {
    label: "Bảo mật SSL",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    label: "Hàng chính hãng",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Newsletter — với loading / success / error state
═══════════════════════════════════════════════════════════════════════════════ */
// Default no-op: resolve ngay nếu parent không truyền prop
const defaultSubscribe = async (_email) => {};

// Validate format email — trả về chuỗi lỗi hoặc null nếu hợp lệ
function validateEmail(value) {
  if (!value) return "Vui lòng nhập email.";
  // RFC 5322 simplified — đủ dùng cho client-side
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email không hợp lệ.";
  return null;
}

function Newsletter({ onSubscribe = defaultSubscribe }) {
  const inputRef = useRef(null);
  const [status, setStatus]         = useState("idle"); // idle | loading | success | error
  const [emailError, setEmailError] = useState(null);   // null | string

  // Validate onBlur — không annoy user khi đang gõ
  const handleBlur = () => {
    const val = inputRef.current?.value?.trim() ?? "";
    // Chỉ validate nếu user đã nhập gì đó
    if (val) setEmailError(validateEmail(val));
  };

  // Xoá lỗi khi user bắt đầu sửa lại
  const handleChange = () => {
    if (emailError) setEmailError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = inputRef.current?.value?.trim() ?? "";

    // Validate lần cuối trước khi submit
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      inputRef.current?.focus();
      return;
    }

    setEmailError(null);
    setStatus("loading");
    try {
      await onSubscribe(email);
      setStatus("success");
      inputRef.current.value = "";
    } catch {
      setStatus("error");
    }
  };

  const isDisabled = status === "loading" || status === "success";
  const inputInvalid = Boolean(emailError);

  return (
    <div>
      <p className="footer__nl-title">Nhận ưu đãi độc quyền</p>
      <p className="footer__nl-desc">
        Flash sale, mã giảm giá và sản phẩm mới — gửi thẳng vào email bạn.
      </p>
      <form className="footer__nl-form" onSubmit={handleSubmit} noValidate>
        <div className="footer__nl-field">
          <input
            ref={inputRef}
            id="footer-email"
            type="email"
            placeholder="email@example.com"
            aria-label="Email của bạn"
            aria-describedby={inputInvalid ? "footer-email-error" : undefined}
            aria-invalid={inputInvalid}
            className={`footer__nl-input${inputInvalid ? " footer__nl-input--invalid" : ""}`}
            disabled={isDisabled}
            onBlur={handleChange}
            onChange={handleChange}
          />
          {emailError && (
            <p
              id="footer-email-error"
              className="footer__nl-field-error"
              role="alert"
            >
              {emailError}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="footer__nl-btn"
          disabled={isDisabled}
        >
          {status === "loading" ? "Đang gửi…" : status === "success" ? "Đã đăng ký ✓" : "Đăng ký"}
        </button>
      </form>

      {status === "success" && (
        <p className="footer__nl-feedback footer__nl-feedback--success" role="status">
          Cảm ơn bạn! Kiểm tra email để xác nhận.
        </p>
      )}
      {status === "error" && (
        <p className="footer__nl-feedback footer__nl-feedback--error" role="alert">
          Có lỗi xảy ra, vui lòng thử lại.
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Footer
═══════════════════════════════════════════════════════════════════════════════ */
export default function Footer({ onNewsletterSubscribe }) {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container-page">

        {/* ── Main grid ─────────────────────────────────────────────────────── */}
        <div className="footer__grid">

          {/* Brand column */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polygon
                  points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                  fill="var(--color-accent)"
                  stroke="var(--color-accent)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              TechStore
            </Link>

            <p className="footer__tagline">
              Đại lý chính hãng Apple, Samsung, Google và nhiều thương hiệu hàng đầu. Giao hàng toàn quốc.
            </p>

            <a href="tel:19001234" className="footer__hotline">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z" />
              </svg>
              1900 1234
            </a>

            <div className="footer__socials">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-btn"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.title}>
              <p className="footer__nav-title">{col.title}</p>
              <nav className="footer__nav-list" aria-label={col.title}>
                {col.links.map((l) => (
                  <Link key={l.label} to={l.to} className="footer__nav-link">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          {/* Newsletter */}
          <div className="footer__newsletter-col">
            <Newsletter onSubscribe={onNewsletterSubscribe} />
          </div>
        </div>

        {/* ── Payment strip ──────────────────────────────────────────────────── */}
        <div className="footer__payments">
          <span className="footer__payments-label">Thanh toán</span>
          <div className="footer__payment-badges">
            {PAYMENTS.map(({ label, bg, color, text }) => (
              <span
                key={label}
                title={label}
                className="footer__payment-badge"
                style={{ "--badge-bg": bg, "--badge-color": color }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} TechStore. Bảo lưu mọi quyền.
          </p>

          <div className="footer__trust">
            {TRUST.map(({ label, icon }) => (
              <span key={label} className="footer__trust-item">
                <span className="footer__trust-icon">{icon}</span>
                {label}
              </span>
            ))}
          </div>

          <div className="footer__legal">
            {[
              { to: "/privacy", label: "Chính sách bảo mật" },
              { to: "/terms",   label: "Điều khoản sử dụng" },
            ].map(({ to, label }) => (
              <Link key={label} to={to} className="footer__legal-link">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}