import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CartProvider }              from "./context/CartContext";
import { UserProvider, useUser }     from "./context/UserContext";
import { OrderProvider, useOrder }   from "./context/OrderContext";
import { ToastProvider, useToast }   from "./context/ToastContext";
import { WishlistProvider }          from "./context/WishlistContext";
import { ThemeProvider }             from "./context/ThemeContext";
import { LocaleProvider }            from "./context/LocaleContext";
import { NotificationProvider }      from "./context/NotificationContext";

import Navbar            from "./components/layout/Navbar";
import Footer            from "./components/layout/Footer";
import ErrorBoundary     from "./components/common/ErrorBoundary";

import NotFoundPage      from "./pages/NotFoundPage";
import HomePage          from "./pages/HomePage";
import ProductsPage      from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartCheckoutPage  from "./pages/CartCheckoutPage";
import OrderSuccessPage  from "./pages/OrderSuccessPage";
import OrdersPage        from "./pages/OrdersPage";
import AuthPage          from "./pages/AuthPage";
import ProfilePage       from "./pages/ProfilePage";
import WishlistPage      from "./pages/WishlistPage";
import PaymentPage       from "./pages/PaymentPage";

import AdminLayout    from "./admin/components/layout/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminOrders    from "./admin/pages/AdminOrders";
import AdminProducts  from "./admin/pages/AdminProducts";
import AdminUsers     from "./admin/pages/AdminUsers";

import { useCart } from "./context/CartContext";
import { PRODUCTS } from "./data/products";
import { placeOrder, REQUIRES_PAYMENT } from "./services/orderService";

import "./styles/global.css";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowGuest = false }) {
  const { isLoggedIn, loading } = useUser();
  const location = useLocation();
  if (loading) return null;
  if (!isLoggedIn && !allowGuest) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useUser();
  const { error: toastErr } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (loading || !isLoggedIn || isAdmin) return;
    toastErr("Không có quyền truy cập", "Chỉ quản trị viên mới vào được khu vực này.");
  }, [loading, isLoggedIn, isAdmin, toastErr]);

  if (loading) return null;
  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ─── CartWrapper ──────────────────────────────────────────────────────────────
function CartWrapper({ children }) {
  const { cartAdd } = useToast();
  return (
    <CartProvider onAddToast={cartAdd}>
      <WishlistProvider>
        <OrderProvider>
          {children}
        </OrderProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

// ─── CartCheckoutAdapter ──────────────────────────────────────────────────────
function CartCheckoutAdapter() {
  const navigate = useNavigate();
  const { cart, updateQty, removeItem, clearCart, addItem } = useCart();
  const { setCurrentOrder } = useOrder();
  const { orderCreate } = useToast?.() ?? {};

  const handleSuccess = async (payload) => {
    try {
      const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const tax      = subtotal * 0.08;
      const total    = subtotal
        + (payload.shipping.fee ?? 0)
        + tax
        - (payload.coupon?.discount ?? 0);

      const serverOrder = await placeOrder({ ...payload, items: cart, subtotal, tax, total });

      const order = {
        id:                serverOrder.id,
        status:            serverOrder.status ?? "confirmed",
        estimatedDelivery: serverOrder.estimatedDelivery ?? null,
        items: cart,
        shipping: {
          name:         payload.address.name,
          phone:        payload.address.phone,
          address:      payload.address.address,
          wardName:     payload.address.wardName,
          districtName: payload.address.districtName,
          provinceName: payload.address.provinceName,
          note:         payload.address.note,
          shipperName:  "GHN",
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
      orderCreate?.(order);
      clearCart();

      if (REQUIRES_PAYMENT.includes(payload.payment)) {
        navigate(`/payment/${serverOrder.id}`);
      } else {
        navigate("/order-success");
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <CartCheckoutPage
      cartItems={cart}
      onQuantityChange={updateQty}
      onRemoveItem={removeItem}
      onClearCart={clearCart}
      products={PRODUCTS}
      onAddItem={addItem}
      onSuccess={handleSuccess}
      onBack={() => navigate(-1)}
    />
  );
}

// ─── StorefrontShell ──────────────────────────────────────────────────────────
function StorefrontShell() {
  return (
    <div className="app-shell">
      <Navbar products={PRODUCTS} />
      <main className="main-content w-full max-w-[1440px] mx-auto">
        <ErrorBoundary>
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/products"     element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/auth"         element={<AuthPage />} />
            <Route path="/wishlist"     element={<WishlistPage />} />

            <Route path="/cart"     element={<ProtectedRoute allowGuest><CartCheckoutAdapter /></ProtectedRoute>} />
            <Route path="/checkout" element={<Navigate to="/cart" replace />} />

            <Route path="/payment/:orderId"  element={<ProtectedRoute allowGuest><PaymentPage /></ProtectedRoute>} />

            <Route path="/order-success"     element={<ProtectedRoute allowGuest><OrderSuccessPage /></ProtectedRoute>} />
            <Route path="/orders"            element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:orderId"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LocaleProvider>
          <ToastProvider>
            <UserProvider>
              <NotificationProvider>
                <CartWrapper>
                  <Routes>
                    <Route path="/admin/*"
                      element={
                        <AdminRoute>
                          <ErrorBoundary><AdminLayout /></ErrorBoundary>
                        </AdminRoute>
                      }
                    >
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="orders"    element={<AdminOrders />} />
                      <Route path="products"  element={<AdminProducts />} />
                      <Route path="users"     element={<AdminUsers />} />
                    </Route>

                    <Route path="*" element={<StorefrontShell />} />
                  </Routes>
                </CartWrapper>
              </NotificationProvider>
            </UserProvider>
          </ToastProvider>
        </LocaleProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
