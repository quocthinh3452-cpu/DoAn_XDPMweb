/**
 * CartCheckoutPage — index.jsx
 *
 * Flow địa chỉ + ship:
 *   1. Chọn Tỉnh  → load Quận (GHN)
 *   2. Chọn Quận  → load Phường + load danh sách dịch vụ ship (GHN)
 *   3. Chọn Phường → …
 *   4. Chọn Dịch vụ ship → tính phí + ETA (GHN)
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useUser } from "../../context/UserContext.jsx";

import { COUPONS, TAX_RATE, FREE_SHIP_THRESHOLD } from "./constants.js";
import { validateAddress } from "./utils.js";
import { useShippingFee } from "../../hooks/useShippingFee.js";
import { Icons } from "./icons.jsx";

import CartSection     from "./CartSection.jsx";
import AddressSection  from "./AddressSection.jsx";
import ShippingSection from "./ShippingSection.jsx";
import PaymentSection  from "./PaymentSection.jsx";
import OrderSummary    from "./OrderSummary.jsx";
import EmptyCart       from "./EmptyCart.jsx";

import "./CartCheckoutPage.css";

const EMPTY_FORM = {
  name:         "",
  phone:        "",
  provinceId:   "",
  provinceName: "",
  districtId:   "",
  districtName: "",
  wardCode:     "",
  wardName:     "",
  address:      "",
  note:         "",
};

export default function CartCheckoutPage({
  cartItems = [],
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  products = [],
  onAddItem,
  discount: externalDiscount = 0,
  onSuccess,
  onBack,
}) {
  // ── Address form
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState(null);

  // ── Shipping service
  const [serviceTypeId, setServiceTypeId] = useState(null);

  // ── Payment
  const [paymentId, setPaymentId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ── Coupon
  const [couponInput,   setCouponInput]   = useState("");
  const [coupon,        setCoupon]        = useState(null);
  const [couponErr,     setCouponErr]     = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const couponRef = useRef(null);

  // ── Remove animation
  const [removingIds, setRemovingIds] = useState(new Set());

  // ── Tự điền form từ UserContext khi đã đăng nhập ─────────────────────────
  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name:         user.name         ?? prev.name,
      phone:        user.phone        ?? prev.phone,
      address:      user.address      ?? prev.address,
      provinceId:   user.provinceId   ?? prev.provinceId,
      provinceName: user.provinceName ?? prev.provinceName,
      districtId:   user.districtId   ?? prev.districtId,
      districtName: user.districtName ?? prev.districtName,
      wardCode:     user.wardCode     ?? prev.wardCode,
      wardName:     user.wardName     ?? prev.wardName,
    }));
  }, [user]);

  // Reset service khi đổi quận
  useEffect(() => {
    setServiceTypeId(null);
  }, [form.districtId]);

  // ── Tính phí ship tự động qua GHN ────────────────────────────────────────
  const {
    fee:     ghnFee,
    eta:     ghnEta,
    loading: feeLoading,
    error:   feeError,
  } = useShippingFee({
    districtId:    form.districtId  || null,
    wardCode:      form.wardCode    || null,
    serviceTypeId: serviceTypeId    || null,
  });

  // ── Derived ───────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    [cartItems],
  );

  const couponDiscount   = coupon?.discount ?? 0;
  const freeShipByCoupon = coupon?.freeShip ?? false;
  const shippingFee      = freeShipByCoupon || subtotal >= FREE_SHIP_THRESHOLD ? 0 : ghnFee;
  const tax              = (subtotal - couponDiscount - externalDiscount) * TAX_RATE;

  const addressErrors = useMemo(() => validateAddress(form), [form]);

  const canPlace = useMemo(
    () =>
      cartItems.length > 0 &&
      Object.keys(addressErrors).length === 0 &&
      !!serviceTypeId &&
      shippingFee !== null &&
      !feeLoading &&
      !!paymentId,
    [cartItems, addressErrors, serviceTypeId, shippingFee, feeLoading, paymentId],
  );
  
  const paySectionError = submitted && !paymentId
    ? "Vui lòng chọn phương thức thanh toán"
    : null;

  // Recalculate coupon discount khi subtotal thay đổi
  useEffect(() => {
    if (!coupon) return;
    const c = COUPONS[coupon.code];
    if (c) setCoupon((prev) => ({ ...prev, discount: c.apply(subtotal) }));
  }, [subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Address handlers ──────────────────────────────────────────────────────
  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBlur  = useCallback((key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setFocused(null);
  }, []);

  const handleFocus = useCallback((key) => setFocused(key), []);

  // ── Remove with animation ─────────────────────────────────────────────────
  const handleRemove = useCallback((id) => {
    setRemovingIds((s) => new Set(s).add(id));
    setTimeout(() => {
      onRemoveItem?.(id);
      setRemovingIds((s) => { const n = new Set(s); n.delete(id); return n; });
    }, 320);
  }, [onRemoveItem]);

  // ── Coupon handlers ───────────────────────────────────────────────────────
  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponErr("");
    await new Promise((r) => setTimeout(r, 600));
    setCouponLoading(false);
    if (COUPONS[code]) {
      const c = COUPONS[code];
      setCoupon({ code, label: c.label, discount: c.apply(subtotal), freeShip: !!c.freeShip });
      setCouponInput("");
    } else {
      setCouponErr("Mã giảm giá không hợp lệ.");
      couponRef.current?.focus();
    }
  };

  const removeCoupon = () => { setCoupon(null); setCouponErr(""); };

  // ── Place order ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setTouched({
      name: true, phone: true, address: true,
      provinceId: true, districtId: true, wardCode: true,
    });
    if (!canPlace) return;

    onSuccess?.({
      address: {
        name:         form.name,
        phone:        form.phone,
        provinceName: form.provinceName,
        districtName: form.districtName,
        wardName:     form.wardName,
        address:      form.address,
        note:         form.note,
        provinceId:   form.provinceId,
        districtId:   form.districtId,
        wardCode:     form.wardCode,
      },
      shipping: {
        serviceTypeId,
        fee: shippingFee,
        eta: ghnEta,
      },
      payment: paymentId,
      coupon:  coupon ? { code: coupon.code, discount: couponDiscount } : null,
    });
  }, [canPlace, form, serviceTypeId, shippingFee, ghnEta, paymentId, coupon, couponDiscount, onSuccess]);

  if (!cartItems.length) return <EmptyCart onBack={onBack} />;

  return (
    <div className="cc-page">
      <div className="cc-header">
        <button type="button" className="cc-back-btn" onClick={onBack}>
          <Icons.ChevronLeft />
        </button>
        <h1 className="cc-page-title">Đặt hàng</h1>
      </div>

      <div className="cc-layout">
        {/* ── Left column ── */}
        <div className="cc-main">
          {/* 1. Giỏ hàng */}
          <CartSection
            items={cartItems}
            removingIds={removingIds}
            onQtyChange={onQuantityChange}
            onRemove={handleRemove}
            onClear={onClearCart}
          />

          {/* 2. Địa chỉ */}
          <AddressSection
            form={form}
            errors={addressErrors}
            touched={touched}
            focused={focused}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />

          {/* 3. Vận chuyển — chỉ hiện sau khi chọn tỉnh */}
          <ShippingSection
            districtId={form.districtId}
            wardCode={form.wardCode}
            selectedServiceTypeId={serviceTypeId}
            onSelect={setServiceTypeId}
            shippingFee={shippingFee}
            eta={ghnEta}
            feeLoading={feeLoading}
            error={feeError}
          />

          {/* 4. Thanh toán */}
          <PaymentSection
            paymentId={paymentId}
            onSelect={setPaymentId}
            error={paySectionError}
          />
        </div>

        {/* ── Right column ── */}
        <aside className="cc-aside">
          <OrderSummary
            items={cartItems}
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            externalDiscount={externalDiscount}
            shippingFee={shippingFee}
            feeLoading={feeLoading}
            tax={tax}
            canPlace={canPlace}
            onPlace={handleSubmit}
            coupon={coupon}
            couponInput={couponInput}
            couponError={couponErr}
            couponLoading={couponLoading}
            couponRef={couponRef}
            onCouponInputChange={(e) => { setCouponInput(e.target.value); setCouponErr(""); }}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
          />
        </aside>
      </div>
    </div>
  );
}
