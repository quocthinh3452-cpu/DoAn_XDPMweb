import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

function OrderDetailPage() {
    const { order_code } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelForm, setShowCancelForm] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await apiClient.get(`/orders/${order_code}`);
                setOrder(response.data);
            } catch (error) {
                console.error("Lỗi tải chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [order_code]);

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert("Vui lòng nhập lý do hủy đơn.");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác!")) return;

        try {
            setIsCancelling(true);
            await apiClient.post(`/orders/${order_code}/cancel`, { reason: cancelReason });
            alert("Đã hủy đơn hàng thành công.");
            window.location.reload(); // Tải lại trang để cập nhật trạng thái mới
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn.");
        } finally {
            setIsCancelling(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const getStatusUI = (status) => {
        switch (status) {
            case 'pending': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">Chờ xác nhận</span>;
            case 'cancel_requested': return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-bold">Chờ duyệt hủy</span>;
            case 'processing': return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-sm font-bold">Đang xử lý</span>;
            case 'completed': return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-bold">Đã giao</span>;
            case 'cancelled': return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-bold">Đã hủy</span>;
            default: return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-bold">{status}</span>;
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Đang tải chi tiết đơn hàng...</div>;
    if (!order) return <div className="text-center py-20 text-red-500 font-medium">Không tìm thấy đơn hàng!</div>;

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/orders" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">← Quay lại danh sách</Link>
                <h1 className="text-3xl font-extrabold text-gray-900">Chi tiết đơn hàng #{order.order_code}</h1>
            </div>

            {/* ============ KHU VỰC HỦY ĐƠN HÀNG ============ */}
            
            {/* 1. Nút hiển thị form hủy (Chỉ hiện khi đang pending) */}
            {order.status === 'pending' && !showCancelForm && (
                <div className="mb-6 flex justify-end">
                    <button 
                        onClick={() => setShowCancelForm(true)}
                        className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100"
                    >
                        Hủy đơn hàng này
                    </button>
                </div>
            )}

            {/* 2. Form nhập lý do hủy */}
            {showCancelForm && (
                <div className="mb-8 p-6 bg-red-50 rounded-3xl border border-red-100 animate-fadeIn shadow-sm">
                    <h3 className="text-red-800 font-bold mb-3">Bạn muốn hủy đơn hàng này? Vui lòng cho biết lý do:</h3>
                    <textarea 
                        className="w-full p-4 rounded-2xl border border-red-200 outline-none focus:ring-2 focus:ring-red-300 transition-all text-sm bg-white"
                        placeholder="Ví dụ: Tôi muốn đổi sang màu khác, tôi đổi ý không mua nữa..."
                        rows="3"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end gap-3 mt-4">
                        <button 
                            onClick={() => setShowCancelForm(false)}
                            className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors bg-gray-100"
                        >
                            Đóng lại
                        </button>
                        <button 
                            disabled={isCancelling}
                            onClick={handleCancelOrder}
                            className={`bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 transition-colors ${isCancelling ? 'opacity-70 cursor-wait' : 'hover:bg-red-700'}`}
                        >
                            {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
                        </button>
                    </div>
                </div>
            )}

            {/* 3. Hiển thị lý do nếu đơn đã bị hủy */}
            {(order.status === 'cancelled' || order.status === 'cancel_requested') && order.cancel_reason && (
                <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-200">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Lý do đã hủy:
                    </p>
                    <p className="text-gray-800 italic font-medium leading-relaxed pl-7">"{order.cancel_reason}"</p>
                </div>
            )}
            
            {/* ============================================== */}

            <div className="flex flex-col md:flex-row gap-8">
                {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
                <div className="w-full md:w-2/3">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800">Sản phẩm đã mua</h2>
                            {getStatusUI(order.status)}
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 text-lg mb-1">{item.product_name}</p>
                                        <p className="text-gray-500 text-sm">Đơn giá: {formatPrice(item.unit_price)}</p>
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-sm text-gray-500 mb-1">Số lượng</p>
                                        <p className="font-bold text-gray-800">x{item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">Thành tiền</p>
                                        <p className="font-bold text-red-600 text-lg">{formatPrice(item.total_price || (item.unit_price * item.quantity))}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-100">
                            <span className="text-lg font-bold text-gray-700">Tổng cộng:</span>
                            <span className="text-2xl font-extrabold text-red-600">{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN GIAO HÀNG */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">Thông tin nhận hàng</h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Email</p>
                                <p className="font-semibold text-gray-900">{order.customer_email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Số điện thoại</p>
                                <p className="font-semibold text-gray-900">{order.customer_phone}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Địa chỉ giao hàng</p>
                                <p className="font-semibold text-gray-900 leading-relaxed">{typeof order.shipping_address === 'string'
                                    ? order.shipping_address
                                    : Array.isArray(order.shipping_address)
                                        ? order.shipping_address.join(', ')
                                        : JSON.stringify(order.shipping_address)
                                }</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">Thanh toán</h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Phương thức</p>
                                <p className="font-semibold text-gray-900">
                                    {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.payment_method}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Ngày đặt hàng</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(order.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;