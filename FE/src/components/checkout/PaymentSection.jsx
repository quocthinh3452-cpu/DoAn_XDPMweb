import { PAYMENTS } from "./constants.js";
import { Icons } from "./icons.jsx";
import { SectionTitle, RadioCard } from "./primitives.jsx";

export default function PaymentSection({ paymentId, onSelect, error }) {
  const active = PAYMENTS.find((p) => p.id === paymentId);

  return (
    <div className="cc-card">
      <SectionTitle number="4" title="Phương thức thanh toán" />
      {error && <p className="cc-section-err">{error}</p>}

      <div className="cc-rcard-list">
        {PAYMENTS.map((m) => {
          const PayIcon = Icons.Pay[m.id] || Icons.Wallet;
          return (
            <RadioCard
              key={m.id}
              selected={paymentId === m.id}
              onClick={() => onSelect(m.id)}
              icon={<PayIcon />}
              name={m.label}
              sub={m.desc}
            />
          );
        })}
      </div>

      {active && (
        <div
          className="cc-pay-info"
          style={{ background: active.infoBg, borderColor: active.infoColor + "40" }}
        >
          <Icons.Info style={{ color: active.infoColor, width: 13, height: 13, flexShrink: 0 }} />
          <p className="cc-pay-info-text" style={{ color: active.infoColor }}>{active.info}</p>
        </div>
      )}
    </div>
  );
}
