import { cn } from "./utils.js";
import { Icons } from "./icons.jsx";

export default function CouponSection({
  coupon, input, error, loading, inputRef,
  onInputChange, onApply, onRemove,
}) {
  return (
    <div className="cc-card cc-coupon-card">
      {coupon ? (
        <div className="cc-coupon-applied">
          <span className="cc-coupon-tick"><Icons.Check /></span>
          <div>
            <p className="cc-coupon-code">{coupon.code}</p>
            <p className="cc-coupon-label">{coupon.label}</p>
          </div>
          <button className="cc-coupon-remove" onClick={onRemove} aria-label="Xóa mã">
            <Icons.X />
          </button>
        </div>
      ) : (
        <div className="cc-coupon-row">
          <div className="cc-coupon-field">
            <span className="cc-coupon-icon"><Icons.Tag /></span>
            <input
              ref={inputRef}
              className={cn("cc-coupon-input", error && "cc-coupon-input--err")}
              placeholder="Mã giảm giá"
              value={input}
              onChange={onInputChange}
              onKeyDown={(e) => e.key === "Enter" && onApply()}
            />
          </div>
          <button
            className="cc-coupon-btn"
            onClick={onApply}
            disabled={loading || !input.trim()}
          >
            {loading ? <span className="cc-spinner" /> : "Áp dụng"}
          </button>
        </div>
      )}
      {error && <p className="cc-coupon-err">{error}</p>}
      {!coupon && !error && (
        <p className="cc-coupon-hint">Thử: SAVE10, TECH20, FREE</p>
      )}
    </div>
  );
}
