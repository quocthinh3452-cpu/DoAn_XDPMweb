import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/adminService';

function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardStats().then(setStats).catch(console.error);
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (!stats) return <div className="text-center py-20 text-gray-500 animate-pulse text-xl font-medium">Đang tải dữ liệu tổng quan...</div>;

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Tổng quan hệ thống</h1>
            
            {/* 4 Khối Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Doanh thu thực tế</p>
                    <p className="text-3xl font-extrabold text-green-600">{formatPrice(stats.total_revenue)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Tổng Đơn hàng</p>
                    <p className="text-3xl font-extrabold text-blue-600">{stats.total_orders}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Sản phẩm</p>
                    <p className="text-3xl font-extrabold text-purple-600">{stats.total_products}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Khách hàng</p>
                    <p className="text-3xl font-extrabold text-orange-600">{stats.total_users}</p>
                </div>
            </div>

            {/* Bảng Đơn hàng gần đây */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">5 Đơn hàng mới nhất</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <th className="p-4 font-semibold rounded-tl-lg">Mã ĐH</th>
                                <th className="p-4 font-semibold">Khách hàng</th>
                                <th className="p-4 font-semibold">Tổng tiền</th>
                                <th className="p-4 font-semibold">Thanh toán</th>
                                <th className="p-4 font-semibold rounded-tr-lg">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recent_orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-blue-600">#{order.order_code}</td>
                                    <td className="p-4">{order.customer_email}</td>
                                    <td className="p-4 font-bold text-red-600">{formatPrice(order.total_amount)}</td>
                                    <td className="p-4 uppercase text-xs font-bold text-gray-500">{order.payment_method}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;