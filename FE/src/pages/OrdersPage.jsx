import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import { useUser } from '../context/UserContext';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                console.error('Lỗi khi tải đơn hàng:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Chuyển đổi trạng thái tiếng Anh trong DB sang tiếng Việt
    const getStatusText = (status) => {
        const statuses = {
            'pending': 'Chờ xác nhận',
            'processing': 'Đang xử lý',
            'shipped': 'Đang giao hàng',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy'
        };
        return statuses[status] || status;
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Vui lòng đăng nhập</h2>
                    <p className="text-gray-500 mb-8">Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.</p>
                    <Link to="/auth" className="btn-primary">Đăng nhập ngay</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl min-h-[60vh]">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

            {loading ? (
                <div className="text-center py-10 text-gray-500 animate-pulse font-medium">Đang tải danh sách đơn hàng...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 mb-6 text-lg">Bạn chưa có đơn hàng nào.</p>
                    <Link to="/" className="btn-primary">Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Mã đơn: <span className="text-blue-600">#{order.order_code}</span></h3>
                                <p className="text-sm text-gray-500 mt-2">Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')} lúc {new Date(order.created_at).toLocaleTimeString('vi-VN')}</p>
                                <p className="text-sm text-gray-500 mt-1">Phương thức thanh toán: <span className="uppercase font-medium text-gray-700">{order.payment_method}</span></p>
                                <Link to={`/orders/${order.order_code}`} className="text-blue-600 font-semibold hover:underline mt-3 inline-block">
                                    Xem chi tiết đơn hàng →
                                </Link>
                            </div>
                            <div className="text-left md:text-right mt-4 md:mt-0">
                                <p className="text-2xl font-extrabold text-red-600 mb-2">{formatPrice(order.total_amount)}</p>
                                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrdersPage;