import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/Navbar/Navbar';
import Footer from './components/layout/Footer';

// Pages dành cho Khách hàng
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CartCheckoutPage from './pages/CartCheckoutPage';
import AuthPage from './pages/AuthPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
// Pages dành cho Admin
import AdminLayout from './admin/components/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminOrders from './admin/pages/AdminOrders';
import AdminProducts from './admin/pages/AdminProducts'; // <-- Khai báo component AdminProducts
import AdminAddProduct from './admin/pages/AdminAddProduct';
import AdminEditProduct from './admin/pages/AdminEditProduct';
import AdminCategories from './admin/pages/AdminCategories';
import AdminBanners from './admin/pages/AdminBanners';
// Component này xử lý logic Ẩn/Hiện Navbar và Footer
function AppContent() {
  const location = useLocation();
  // Kiểm tra xem URL hiện tại có bắt đầu bằng /admin không
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Chỉ hiện Navbar khách hàng nếu KHÔNG PHẢI trang admin */}
      {!isAdminRoute && <Navbar />}

      {/* Trang Admin không cần padding-top vì không có Navbar dính ở trên */}
      <main className={`flex-grow ${!isAdminRoute ? 'pt-[72px]' : ''}`}>
        <Routes>
          {/* Các Route của Khách hàng */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CartCheckoutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:order_code" element={<OrderDetailPage />} />  
          {/* Các Route của Admin được bọc trong AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} /> {/* <-- Route quan trọng đã được thêm */}
            <Route path="products/new" element={<AdminAddProduct />} />
            <Route path="products/edit/:id" element={<AdminEditProduct />} /> {/* Route để sửa sản phẩm, :id là tham số động */}  
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
          </Route>
        </Routes>
      </main>

      {/* Chỉ hiện Footer nếu KHÔNG PHẢI trang admin */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;