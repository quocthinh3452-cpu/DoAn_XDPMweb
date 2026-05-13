import { createContext, useContext, useState, useCallback } from "react";
import { placeOrder, REQUIRES_PAYMENT } from "../services/orderService";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [currentOrder, setCurrentOrder] = useState(null);

  /**
   * createOrder(data) → được gọi từ CartCheckoutAdapter
   *
   * data = { items, address, shipping, payment, coupon }
   *
   * Returns:
   *   { needsPayment: false, order }          → COD, navigate /order-success
   *   { needsPayment: true,  order, server }  → navigate /payment/:id
   */
  const createOrder = useCallback(async (data) => {
    const { items, address, shipping, payment, coupon } = data;

    const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax         = subtotal * 0.08;
    const shippingFee = shipping.fee ?? 0;
    const discount    = coupon?.discount ?? 0;
    const total       = subtotal + shippingFee + tax - discount;

    // Throws nếu lỗi — CartCheckoutAdapter catch → navigate /order-success?error
    const serverOrder = await placeOrder({
      items, address, shipping, payment, coupon,
      subtotal, tax, total,
    });

    const order = {
      id:                serverOrder.id,
      status:            serverOrder.status,
      estimatedDelivery: serverOrder.estimatedDelivery ?? null,
      items,
      shipping: {
        name:        address.name,
        phone:       address.phone,
        address:     address.address,
        district:    address.district,
        province:    address.province,
        note:        address.note,
        shipperName: shipping.name,
        eta:         shipping.eta,
        fee:         shippingFee,
      },
      payment: { method: payment },
      coupon:  coupon ?? null,
      subtotal,
      shippingFee,
      tax,
      total,
    };

    setCurrentOrder(order);

    const needsPayment = REQUIRES_PAYMENT.includes(payment);
    return {
      needsPayment,
      order,
      // Thông tin server trả thêm cho trang payment
      qr:        serverOrder.qr        ?? null,  // VietQR
      walletUrl: serverOrder.walletUrl ?? null,  // Wallet redirect
    };
  }, []);

  /** Gọi sau khi polling xác nhận paid/failed để cập nhật status */
  const updateOrderStatus = useCallback((status) => {
    setCurrentOrder((prev) => prev ? { ...prev, status } : prev);
  }, []);

  return (
    <OrderContext.Provider value={{ currentOrder, setCurrentOrder, createOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder phải dùng bên trong <OrderProvider>");
  return ctx;
}