import React, { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '../services/adminService';
// THÊM DÒNG NÀY: Import apiClient để gọi API duyệt hủy (Nhớ kiểm tra lại đường dẫn cho đúng nhé)
import apiClient from '../../services/apiClient'; 

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getAdminOrders();
            setOrders(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            alert('Đã cập nhật trạng thái đơn hàng!');
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            alert('Cập nhật thất bại!');
            console.error(error);
        }
    };

    // --- 2 HÀM MỚI: XỬ LÝ YÊU CẦU HỦY ---
    const handleApproveCancel = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn DUYỆT hủy đơn hàng này không?")) return;
        try {
            await apiClient.post(`/admin/orders/${orderId}/approve-cancel`);
            alert("Đã duyệt hủy đơn hàng thành công!");
            // Cập nhật state đổi sang cancelled
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi duyệt hủy.");
        }
    };

    const handleRejectCancel = async (orderId) => {
        if (!window.confirm("Từ chối hủy? Đơn hàng sẽ quay lại trạng thái Chờ xác nhận để tiếp tục giao.")) return;
        try {
            await apiClient.post(`/admin/orders/${orderId}/reject-cancel`);
            alert("Đã từ chối hủy. Đơn hàng tiếp tục được xử lý.");
            // Cập nhật state quay về pending và xóa lý do
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'pending', cancel_reason: null } : o));
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi từ chối hủy.");
        }
    };
    // ------------------------------------

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse font-medium text-xl">Đang tải danh sách đơn hàng...</div>;

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Quản lý Đơn hàng</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <th className="p-4 font-semibold whitespace-nowrap">Mã ĐH</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Ngày đặt</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Khách hàng</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Tổng tiền</th>
                                <th className="p-4 font-semibold whitespace-nowrap text-center">Trạng thái / Xử lý</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-blue-600">#{order.order_code}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-900">{order.customer_email}</p>
                                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                                    </td>
                                    <td className="p-4 font-bold text-red-600">{formatPrice(order.total_amount)}</td>
                                    <td className="p-4">
                                        
                                        {/* KIỂM TRA TRẠNG THÁI: NẾU LÀ YÊU CẦU HỦY THÌ HIỆN NÚT */}
                                        {order.status === 'cancel_requested' ? (
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <div className="bg-orange-50 border border-orange-200 p-2 rounded-lg text-center">
                                                    <p className="text-orange-700 font-bold text-sm mb-1">⚠️ Yêu cầu hủy đơn</p>
                                                    {order.cancel_reason && (
                                                        <p className="text-xs text-orange-600 italic">"{order.cancel_reason}"</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleApproveCancel(order.id)} 
                                                        className="flex-1 bg-red-600 text-white text-xs py-2 rounded-md font-bold hover:bg-red-700 transition-colors shadow-sm"
                                                    >
                                                        Duyệt Hủy
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectCancel(order.id)} 
                                                        className="flex-1 bg-gray-200 text-gray-800 text-xs py-2 rounded-md font-bold hover:bg-gray-300 transition-colors shadow-sm"
                                                    >
                                                        Từ Chối
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* NẾU LÀ TRẠNG THÁI BÌNH THƯỜNG THÌ HIỆN DROPDOWN */
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`px-3 py-2 rounded-lg text-sm font-semibold outline-none border cursor-pointer w-full max-w-[200px] ${
                                                    order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                                                    order.status === 'shipped' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                    'bg-blue-50 border-blue-200 text-blue-700'
                                                }`}
                                            >
                                                <option value="pending">Chờ xác nhận</option>
                                                <option value="processing">Đang xử lý</option>
                                                <option value="shipped">Đang giao hàng</option>
                                                <option value="delivered">Đã giao</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>
                                        )}

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

export default AdminOrders;