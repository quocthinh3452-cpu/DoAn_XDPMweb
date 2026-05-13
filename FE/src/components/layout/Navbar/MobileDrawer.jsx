/**
 * MobileDrawer.jsx
 *
 * Cập nhật: Lấy dữ liệu danh mục thật từ API thay vì dùng MEGA_CATS static.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { useToast } from "../../../context/ToastContext";
import { useCart } from "../../../context/CartContext";
import { CAT_ICONS, FallbackCatIcon } from "./NavbarIcons";
import apiClient from '../../../services/apiClient';

export function MobileDrawer({ open, onClose, onOpenSearch }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { user, isLoggedIn, logout } = useUser();
  const { success } = useToast();
  const { items } = useCart();

  // 1. Khai báo State để lưu danh mục từ API
  const [categories, setCategories] = useState([]);

  // 2. Gọi API lấy danh mục khi menu được mở
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await apiClient.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh mục cho mobile menu:", error);
      }
    };

    if (open) {
      fetchCats();
    }
  }, [open]);

  const itemCount = items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const handleLogout = useCallback(async () => {
    await logout();
    success("Đã đăng xuất", "Hẹn gặp lại!");
    navigate("/");
    onClose();
  }, [logout, success, navigate, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-[299]"
          onClick={onClose}
          style={{ animation: "tsNavFadeInMenu 200ms ease" }}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-dvh w-[min(320px,85vw)] bg-white border-l border-gray-100 z-[300] flex flex-col transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 shrink-0">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                fill="#3B82F6" stroke="#3B82F6" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold text-lg text-gray-900">TechStore</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Search shortcut */}
        <button
          onClick={() => { onClose(); onOpenSearch(); }}
          className="flex items-center gap-2.5 mx-5 my-4 px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl shrink-0 text-gray-500 hover:border-blue-300 transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="flex-1 text-left text-sm font-medium">Tìm sản phẩm…</span>
        </button>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3 pb-4">
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-bold transition-colors ${pathname === "/" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Trang chủ
          </Link>

          {/* Categories - DỮ LIỆU THẬT TỪ API */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-6 pb-2">Danh mục</p>
          
          {categories.length > 0 ? (
            categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
              >
                <span className="text-blue-500" style={{ width: 16, height: 16, display: "flex" }}>
                  {CAT_ICONS[cat.slug] ?? <FallbackCatIcon />}
                </span>
                {cat.name}
              </Link>
            ))
          ) : (
            <p className="px-4 py-2 text-xs text-gray-400 italic">Đang tải danh mục...</p>
          )}

          {/* Account */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-6 pb-2">Tài khoản</p>
          {isLoggedIn ? (
            <>
              <Link to="/orders" onClick={onClose} className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Đơn hàng</Link>
              <Link to="/profile" onClick={onClose} className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Trang cá nhân</Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={onClose} className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Đăng nhập / Đăng ký
            </Link>
          )}
        </nav>

        {/* Cart CTA */}
        <div className="px-5 pb-8 shrink-0">
          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-md shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            Xem giỏ hàng
            {itemCount > 0 && (
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-extrabold">{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}