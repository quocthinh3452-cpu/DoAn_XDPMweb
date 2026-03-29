import { cn } from "./utils.js";
import { Icons } from "./icons.jsx";

export function SectionTitle({ number, title, subtitle }) {
  return (
    <div className="cc-section-title">
      <div className="cc-section-num">{number}</div>
      <div>
        <div className="cc-section-name">{title}</div>
        {subtitle && <div className="cc-section-sub">{subtitle}</div>}
      </div>
    </div>
  );
}

export function InputWrap({ icon, error, focused, children }) {
  return (
    <div className={cn("cc-input-wrap", focused && "cc-input-wrap--focus", error && "cc-input-wrap--err")}>
      <span className="cc-input-icon">{icon}</span>
      {children}
    </div>
  );
}

export function Field({ label, required, error, touched, children }) {
  return (
    <div className="cc-field">
      <label className="cc-label">
        {label}{required && <span className="cc-req"> *</span>}
      </label>
      {children}
      {touched && error && <span className="cc-err-msg">{error}</span>}
    </div>
  );
}

export function ValidMark({ show }) {
  return show ? <span className="cc-valid"><Icons.Check /></span> : null;
}

export function RadioCard({ selected, disabled, onClick, icon, name, sub, right }) {
  return (
    <button
      type="button"
      className={cn("cc-rcard", selected && "cc-rcard--sel", disabled && "cc-rcard--disabled")}
      onClick={disabled ? undefined : onClick}
    >
      <span className={cn("cc-rdot", selected && "cc-rdot--on")}>
        {selected && <span className="cc-rdot-inner" />}
      </span>
      <span className="cc-rcard-icon">{icon}</span>
      <div className="cc-rcard-info">
        <div className="cc-rcard-name">{name}</div>
        <div className="cc-rcard-sub">{sub}</div>
      </div>
      {right && <div className="cc-rcard-right">{right}</div>}
    </button>
  );
}
