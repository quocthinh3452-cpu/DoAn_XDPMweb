import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CartCheckoutPage from "../components/checkout/index.jsx";
import { useOrder } from "../context/OrderContext";
import { useCart }  from "../context/CartContext";
import { placeOrder, REQUIRES_PAYMENT } from "../services/orderService";

/**
 * Route: /cart
 *
 * Sau khi user submit:
 *   COD     → /order-success
 *   VietQR / MoMo / ZaloPay → /payment/:orderId
 */
export default function CartPage() {
  const navigate = useNavigate();
  const { setCurrentOrder } = useOrder();
  const { items, updateQty, removeItem, clearCart, catalog } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const handleSuccess = async (payload) => {
    setSubmitting(true);
    setError(null);

    try {
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const tax      = subtotal * 0.08;
      const total    = subtotal
        + (payload.shipping.fee ?? 0)
        + tax
        - (payload.coupon?.discount ?? 0);

      // Gọi API đặt hàng
      const serverOrder = await placeOrder({ ...payload, items, subtotal, tax, total });

      // Build order object
      const order = {
        id:                serverOrder.id,
        status:            serverOrder.status ?? "confirmed",
        estimatedDelivery: serverOrder.estimatedDelivery ?? null,
        items,
        shipping: {
          name:         payload.address.name,
          phone:        payload.address.phone,
          address:      payload.address.address,
          wardName:     payload.address.wardName,
          districtName: payload.address.districtName,
          provinceName: payload.address.provinceName,
          note:         payload.address.note,
          shipperName:  "GHN",
          eta:          null,
          fee:          payload.shipping.fee,
        },
        payment: { method: payload.payment },
        coupon:  payload.coupon ?? null,
        subtotal,
        shippingFee: payload.shipping.fee,
        tax,
        total,
      };

      setCurrentOrder(order);
      clearCart();

      // ── Điều hướng theo payment method ──────────────────────────────────
      const needsPayment = REQUIRES_PAYMENT.includes(payload.payment);
      if (needsPayment) {
        navigate(`/payment/${serverOrder.id}`);
      } else {
        navigate("/order-success");
      }
    } catch (err) {
      setError(err.message ?? "Đặt hàng thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CartCheckoutPage
      cartItems={items}
      onQuantityChange={updateQty}
      onRemoveItem={removeItem}
      onClearCart={clearCart}
      products={catalog}
      onAddItem={(p) => updateQty(p.id, 1, p)}
      onSuccess={handleSuccess}
      onBack={() => navigate("/products")}
      disabled={submitting}
      error={error}
    />
  );
}
