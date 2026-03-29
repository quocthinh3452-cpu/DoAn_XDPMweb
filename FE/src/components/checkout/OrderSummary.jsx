import { fmt, cn } from "./utils.js";
import { Icons } from "./icons.jsx";
import { FREE_SHIP_THRESHOLD } from "./constants.js";
import CouponSection from "./CouponSection.jsx";

export default function OrderSummary({
  items, subtotal, couponDiscount, externalDiscount,
  shippingFee, tax, canPlace, onPlace,
  // ── Coupon props ──
  coupon, couponInput, couponError, couponLoading, couponRef,
  onCouponInputChange, onApplyCoupon, onRemoveCoupon,
}) {
  const total = subtotal - couponDiscount - externalDiscount + (shippingFee ?? 0) + tax;

  return (
    <div className="cc-summary">
      <div className="cc-summary-head">Tóm tắt đơn hàng</div>

      {/* ── Item list ── */}
      <div className="cc-summary-items">
        {items.map((item) => (
          <div key={item.id} className="cc-summary-item">
            <div className="cc-summary-thumb">
              {item.thumbnail
                ? <img src={item.thumbnail} alt={item.name} />
                : <Icons.Package />}
              <span className="cc-summary-qty">{item.quantity}</span>
            </div>
            <div className="cc-summary-name">
              {item.name}{item.variant ? ` · ${item.variant}` : ""}
            </div>
            <div className="cc-summary-price">{fmt(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>

      {/* ── Price rows ── */}
      <div className="cc-summary-rows">
        <div className="cc-summary-row">
          <span>Tạm tính</span><span>{fmt(subtotal)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="cc-summary-row cc-summary-row--disc">
            <span>Mã giảm giá</span><span>−{fmt(couponDiscount)}</span>
          </div>
        )}
        {externalDiscount > 0 && (
          <div className="cc-summary-row cc-summary-row--disc">
            <span>Giảm giá khác</span><span>−{fmt(externalDiscount)}</span>
          </div>
        )}
        <div className="cc-summary-row">
          <span>Thuế (8%)</span><span>{fmt(tax)}</span>
        </div>
        <div className="cc-summary-row">
          <span>Vận chuyển</span>
          {shippingFee == null
            ? <span className="cc-pending">Chưa chọn</span>
            : shippingFee === 0
              ? <span className="cc-free-ship">Miễn phí</span>
              : <span>{fmt(shippingFee)}</span>}
        </div>
      </div>

      {/* ── Coupon ── */}
      <CouponSection
        coupon={coupon}
        input={couponInput}
        error={couponError}
        loading={couponLoading}
        inputRef={couponRef}
        onInputChange={onCouponInputChange}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
      />

      <div className="cc-summary-divider" />

      {/* ── Total ── */}
      <div className="cc-summary-total">
        <span>Tổng cộng</span>
        <span className="cc-summary-total-amt">{fmt(total)}</span>
      </div>

      {shippingFee !== 0 && subtotal < FREE_SHIP_THRESHOLD && (
        <div className="cc-ship-nudge">
          <Icons.Truck />
          <span>
            Thêm <strong>{fmt(FREE_SHIP_THRESHOLD - subtotal)}</strong> để được miễn phí vận chuyển
          </span>
        </div>
      )}

      <p className="cc-tos">
        Bằng cách đặt hàng, bạn đồng ý với{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>điều khoản dịch vụ</a>.
      </p>

      <button
        type="button"
        className={cn("cc-place-btn", !canPlace && "cc-place-btn--disabled")}
        disabled={!canPlace}
        onClick={onPlace}
      >
        <Icons.Check />
        Đặt hàng ngay
      </button>
    </div>
  );
}