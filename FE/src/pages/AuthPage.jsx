import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import "./AuthPage.css";

/* ─── Validation ──────────────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim())              errors.email    = "Email is required.";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email.";
  if (!password)                  errors.password = "Password is required.";
  return errors;
}

function validateRegister({ name, email, password, confirm }) {
  const errors = validateLogin({ email, password });
  if (!name.trim())                    errors.name    = "Full name is required.";
  if (password && password.length < 6) errors.password = "Min. 6 characters.";
  if (confirm !== password)            errors.confirm  = "Passwords do not match.";
  return errors;
}

function validateForgot({ email }) {
  const errors = {};
  if (!email.trim())              errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email.";
  return errors;
}

/* ─── Password strength ───────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)           score++;
  if (pw.length >= 10)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

/* ─── Icons ───────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

/* ─── Atoms ───────────────────────────────────────────────── */
function PasswordToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      className="auth-pw-toggle"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
    >
      <EyeIcon open={show} />
    </button>
  );
}

function SocialButton({ icon, label, onClick }) {
  return (
    <button type="button" className="auth-social-btn" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ─── Field — standalone (not nested inside AuthPage) ─────── */
function AuthField({ id, label, type = "text", placeholder, inputRef, rightSlot, value, onChange, onBlur, onKeyDown, error }) {
  const autoComplete =
    id === "password" ? "current-password" :
    id === "confirm"  ? "new-password"      :
    id === "email"    ? "email"             :
    id === "name"     ? "name"              : "off";

  return (
    <div className="auth-field-wrap">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-input-row">
        <input
          id={id}
          ref={inputRef}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={`auth-input${error ? " auth-input--err" : ""}`}
        />
        {rightSlot}
      </div>
      {error && <p className="auth-field-err" role="alert">{error}</p>}
    </div>
  );
}

/* ─── Password strength meter ─────────────────────────────── */
function StrengthMeter({ password }) {
  const strength = getStrength(password);
  if (!password) return null;
  return (
    <div className="auth-strength-wrap">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="auth-strength-bar"
            style={{ background: i <= strength ? STRENGTH_COLORS[strength] : undefined }}
          />
        ))}
      </div>
      <span className="auth-strength-label" style={{ color: STRENGTH_COLORS[strength] }}>
        {STRENGTH_LABELS[strength]}
      </span>
    </div>
  );
}

/* ─── Views ───────────────────────────────────────────────── */
function ForgotSentView({ email, onBackToLogin, onResend }) {
  return (
    <div className="auth-sent">
      <div className="auth-sent-icon"><CheckCircleIcon /></div>
      <p className="auth-sent-title">Check your inbox</p>
      <p className="auth-sent-desc">
        We sent a reset link to <span className="auth-sent-email">{email}</span>.
        <br />It may take a minute to arrive.
      </p>
      <Button variant="primary" size="lg" fullWidth onClick={onBackToLogin}>
        Back to sign in
      </Button>
      <button className="auth-guest" onClick={onResend}>
        Resend email
      </button>
    </div>
  );
}

function ForgotPasswordView({ form, errors, touched, loading, apiError, firstFieldRef, onFieldChange, onFieldBlur, onSubmit, onBack }) {
  return (
    <>
      <div className="auth-forgot-header">
        <p className="auth-forgot-title">Reset your password</p>
        <p className="auth-forgot-desc">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <div className="auth-form">
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          inputRef={firstFieldRef}
          value={form.email}
          onChange={e => onFieldChange("email", e.target.value)}
          onBlur={() => onFieldBlur("email")}
          onKeyDown={e => e.key === "Enter" && onSubmit()}
          error={touched.email && errors.email}
        />

        {apiError && <p className="auth-api-err" role="alert">{apiError}</p>}

        <Button variant="primary" size="lg" fullWidth loading={loading} onClick={onSubmit}>
          Send reset link
        </Button>

        <div className="auth-footer">
          <button className="auth-link auth-link--icon" onClick={onBack}>
            <ArrowLeftIcon /> Back to sign in
          </button>
        </div>
      </div>
    </>
  );
}

function LoginRegisterView({
  tab, form, errors, touched, loading, apiError,
  showPw, showCfm, firstFieldRef,
  onTabSwitch, onFieldChange, onFieldBlur, onSubmit,
  onTogglePw, onToggleCfm, onForgot, onGuest,
  onSocialClick,
}) {
  const showErr = key => touched[key] && errors[key];
  const handleKeyDown = e => e.key === "Enter" && onSubmit();

  return (
    <>
      {/* Demo hint */}
      <div className="auth-demo">
        <strong>Demo:</strong> demo@techstore.com / demo123 <br/>
        <strong>Admin Demo:</strong> admin@techstore.com / admin123
      </div>

      {/* Tabs */}
      <div className="auth-tabs" role="tablist">
        {[["login", "Sign in"], ["register", "Create account"]].map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`auth-tab${tab === t ? " auth-tab--active" : ""}`}
            onClick={() => onTabSwitch(t)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Social buttons */}
      <div className="auth-social-row">
        <SocialButton icon={<GoogleIcon />} label="Google" onClick={() => onSocialClick("Google")} />
        <SocialButton icon={<GitHubIcon />} label="GitHub" onClick={() => onSocialClick("GitHub")} />
      </div>

      <div className="auth-divider">or continue with email</div>

      {/* Form */}
      <div className="auth-form">
        {tab === "register" && (
          <AuthField
            id="name"
            label="Full name"
            placeholder="Nguyen Van A"
            inputRef={firstFieldRef}
            value={form.name}
            onChange={e => onFieldChange("name", e.target.value)}
            onBlur={() => onFieldBlur("name")}
            onKeyDown={handleKeyDown}
            error={showErr("name")}
          />
        )}

        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          inputRef={tab === "login" ? firstFieldRef : undefined}
          value={form.email}
          onChange={e => onFieldChange("email", e.target.value)}
          onBlur={() => onFieldBlur("email")}
          onKeyDown={handleKeyDown}
          error={showErr("email")}
        />

        <AuthField
          id="password"
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder={tab === "register" ? "Min. 6 characters" : "••••••••"}
          value={form.password}
          onChange={e => onFieldChange("password", e.target.value)}
          onBlur={() => onFieldBlur("password")}
          onKeyDown={handleKeyDown}
          error={showErr("password")}
          rightSlot={<PasswordToggle show={showPw} onToggle={onTogglePw} />}
        />

        {tab === "register" && <StrengthMeter password={form.password} />}

        {tab === "register" && (
          <AuthField
            id="confirm"
            label="Confirm password"
            type={showCfm ? "text" : "password"}
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={e => onFieldChange("confirm", e.target.value)}
            onBlur={() => onFieldBlur("confirm")}
            onKeyDown={handleKeyDown}
            error={showErr("confirm")}
            rightSlot={<PasswordToggle show={showCfm} onToggle={onToggleCfm} />}
          />
        )}

        {tab === "login" && (
          <div className="auth-forgot-link-row">
            <button className="auth-link auth-link--sm" onClick={onForgot}>
              Forgot password?
            </button>
          </div>
        )}

        {apiError && <p className="auth-api-err" role="alert">{apiError}</p>}

        <Button variant="primary" size="lg" fullWidth loading={loading} onClick={onSubmit}>
          {tab === "login" ? "Sign in" : "Create account"}
        </Button>

        <p className="auth-footer">
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button className="auth-link" onClick={() => onTabSwitch(tab === "login" ? "register" : "login")}>
            {tab === "login" ? "Create one" : "Sign in"}
          </button>
        </p>

        <div className="auth-guest-row">
          <button className="auth-guest" onClick={onGuest}>
            Continue as guest
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register }          = useUser();
  const { success, error: toastErr } = useToast();

  const redirectTo = location.state?.from || "/";

  // "login" | "register" | "forgot" | "forgot-sent"
  const [tab,      setTab]      = useState("login");
  const [form,     setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCfm,  setShowCfm]  = useState(false);
  const [animKey,  setAnimKey]  = useState(0);

  const firstFieldRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [tab]);

  const handleFieldChange = useCallback((key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setApiError("");
  }, []);

  const handleFieldBlur = useCallback((key) => {
    setTouched(t => ({ ...t, [key]: true }));
  }, []);

  const switchTab = useCallback((next) => {
    setTab(next);
    setErrors({});
    setTouched({});
    setApiError("");
    setShowPw(false);
    setShowCfm(false);
    setAnimKey(k => k + 1);
  }, []);

  const handleSubmit = async () => {
    if (tab === "forgot") {
      setTouched({ email: true });
      const errs = validateForgot(form);
      setErrors(errs);
      if (Object.keys(errs).length) return;
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
      setTab("forgot-sent");
      setAnimKey(k => k + 1);
      return;
    }

    const allTouched = tab === "login"
      ? { email: true, password: true }
      : { name: true, email: true, password: true, confirm: true };
    setTouched(allTouched);

    const errs = tab === "login" ? validateLogin(form) : validateRegister(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setApiError("");
    try {
      if (tab === "login") {
        const u = await login({ email: form.email, password: form.password });
        success("Welcome back!", u.name);
      } else {
        const u = await register({ name: form.name, email: form.email, password: form.password });
        success("Account created!", `Welcome, ${u.name}`);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError(err.message);
      toastErr("Authentication failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    toastErr("Coming soon", `${provider} login is not yet available.`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" key={animKey}>
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-dot">⚡</div>
          TechStore
        </div>

        {tab === "forgot-sent" && (
          <ForgotSentView
            email={form.email}
            onBackToLogin={() => switchTab("login")}
            onResend={() => switchTab("forgot")}
          />
        )}

        {tab === "forgot" && (
          <ForgotPasswordView
            form={form}
            errors={errors}
            touched={touched}
            loading={loading}
            apiError={apiError}
            firstFieldRef={firstFieldRef}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
            onSubmit={handleSubmit}
            onBack={() => switchTab("login")}
          />
        )}

        {(tab === "login" || tab === "register") && (
          <LoginRegisterView
            tab={tab}
            form={form}
            errors={errors}
            touched={touched}
            loading={loading}
            apiError={apiError}
            showPw={showPw}
            showCfm={showCfm}
            firstFieldRef={firstFieldRef}
            onTabSwitch={switchTab}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
            onSubmit={handleSubmit}
            onTogglePw={() => setShowPw(v => !v)}
            onToggleCfm={() => setShowCfm(v => !v)}
            onForgot={() => switchTab("forgot")}
            onGuest={() => navigate(redirectTo)}
            onSocialClick={handleSocialClick}
          />
        )}
      </div>
    </div>
  );
}
