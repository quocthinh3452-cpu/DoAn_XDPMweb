import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';

function AdminLayout() {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    // Bảo vệ Route ở Frontend: Nếu không phải Admin thì đuổi về trang chủ
    if (!user || user.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h1>
                <p className="text-gray-600 mb-6">Bạn không có quyền quản trị viên.</p>
                <button onClick={() => navigate('/')} className="btn-primary">Về trang chủ</button>
            </div>
        );
    }

    const navClass = (path) => `block px-4 py-3 rounded-xl font-medium transition-colors mb-2 ${location.pathname === path ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar Bên Trái */}
            <aside className="w-64 bg-white shadow-xl border-r border-gray-100 flex flex-col z-20">
                <div className="p-6 border-b border-gray-100 text-center">
                    <Link to="/admin" className="text-2xl font-extrabold text-blue-600 tracking-tight">TechStore<span className="text-gray-800">Admin</span></Link>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <Link to="/admin" className={navClass('/admin')}>📊 Tổng quan</Link>
                    <Link to="/admin/orders" className={navClass('/admin/orders')}>📦 Quản lý Đơn hàng</Link> 
                    <Link to="/admin/products" className={navClass('/admin/products')}>📱 Quản lý Sản phẩm</Link> 
                    <Link to="/admin/categories" className={navClass('/admin/categories')}>📁 Quản lý Danh mục</Link>
                    <Link to="/admin/banners" className={navClass('/admin/banners')}>🖼️ Quản lý Banner</Link>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <Link to="/" className="block text-center px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-50 hover:bg-gray-200 transition-colors">
                        ← Về trang cửa hàng
                    </Link>
                </div>
            </aside>

            {/* Nội dung chính Bên Phải */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet /> {/* Các component con (Dashboard, Orders...) sẽ hiển thị ở đây */}
            </main>
        </div>
    );
}

export default AdminLayout;