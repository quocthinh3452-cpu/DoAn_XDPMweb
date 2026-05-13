import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import apiClient from '../services/apiClient';

function CartCheckoutPage() {
    // Lấy thêm hàm clearCart từ Context
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: '',
        city: '',
        district: '',
        address: '',
        payment_method: 'COD'
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(''); // State lưu thông báo lỗi

    // Nếu giỏ hàng trống thì đá về trang sản phẩm
    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-lg">
                <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
                    <p className="text-gray-500 mb-8">Vui lòng chọn thêm sản phẩm trước khi thanh toán nhé.</p>
                    <button onClick={() => navigate('/products')} className="btn-primary px-8">Quay lại Cửa hàng</button>
                </div>
            </div>
        );
    }

    const shippingFee = 30000;
    
    // TÍNH TOÁN AN TOÀN (Nhận diện đúng số thập phân)
    const subtotal = cartItems.reduce((sum, item) => {
        const sale = parseFloat(item.sale_price);
        const regular = parseFloat(item.regular_price);
        const fallback = parseFloat(item.price);
        
        let price = 0;
        if (sale > 0) price = sale;
        else if (regular > 0) price = regular;
        else if (fallback > 0) price = fallback;

        const qty = Number(item.quantity) || Number(item.cart_quantity) || 1;
        return sum + (price * qty);
    }, 0);
    const totalAmount = subtotal + shippingFee;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(''); // Xóa lỗi cũ nếu có

        // Đóng gói dữ liệu gửi lên API
        const payload = {
            ...formData,
            subtotal: subtotal,
            total_amount: totalAmount,
            items: cartItems
        };

        try {
            // Gọi API lưu đơn hàng
            await apiClient.post('/orders', payload);

            // Xóa sạch giỏ hàng sau khi mua thành công
            if (clearCart) clearCart();

            alert('🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại TechStore.');
            navigate('/orders'); // Chuyển về trang lịch sử đơn hàng

        } catch (error) {
            console.error("Lỗi Checkout:", error);
            // Lấy thông báo lỗi cụ thể từ Backend để hiển thị cho người dùng
            const backendError = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại!';
            setErrorMsg(backendError);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-10">Thanh toán an toàn</h1>

            {/* Hiển thị lỗi nếu có */}
            {errorMsg && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded-r-lg">
                    {errorMsg}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Form điền thông tin */}
                <div className="w-full lg:w-3/5">
                    <form id="checkout-form" onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-8">

                        {/* Khu vực 1: Thông tin giao hàng */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">1. Thông tin giao hàng</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="Nhập email của bạn" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="VD: 0987654321" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh/Thành phố *</label>
                                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="VD: Hồ Chí Minh" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quận/Huyện *</label>
                                    <input required type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="VD: Quận 1" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ cụ thể *</label>
                                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="Số nhà, Tên đường, Phường/Xã..." />
                                </div>
                            </div>
                        </div>

                        {/* Khu vực 2: Phương thức thanh toán */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">2. Phương thức thanh toán</h2>
                            <div className="flex flex-col gap-4">
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.payment_method === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                                    <input type="radio" name="payment_method" value="COD" checked={formData.payment_method === 'COD'} onChange={handleChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                                    <span className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                                </label>

                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.payment_method === 'BANK_TRANSFER' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                                    <input type="radio" name="payment_method" value="BANK_TRANSFER" checked={formData.payment_method === 'BANK_TRANSFER'} onChange={handleChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                                    <span className="font-semibold text-gray-800">Chuyển khoản VietQR</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Cột Tóm tắt đơn hàng */}
                <div className="w-full lg:w-2/5">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Đơn hàng của bạn</h2>

                        <div className="flex flex-col gap-4 mb-6 max-h-80 overflow-y-auto pr-2">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 flex-shrink-0">
                                        <img src={item.primary_image?.image_url || item.images?.[0]?.image_url || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate text-sm">{item.name}</p>

                                        {/* Hiển thị phân loại (Màu / Dung lượng) */}
                                        {(item.selected_color || item.selected_storage) && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {item.selected_color} {item.selected_color && item.selected_storage && ' - '} {item.selected_storage}
                                            </p>
                                        )}

                                        <p className="text-sm font-semibold text-red-600 mt-1">{formatPrice(item.sale_price || item.regular_price)}
                                             <span className="text-gray-500 font-medium text-xs">x{item.quantity || item.cart_quantity || 1}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t border-gray-200 pt-6 mb-6">
                            <div className="flex justify-between text-gray-600 font-medium">
                                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 font-medium">
                                <span>Phí giao hàng</span>
                                <span>{formatPrice(shippingFee)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-200 pt-6 mb-8">
                            <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                            <span className="text-2xl font-extrabold text-red-600">{formatPrice(totalAmount)}</span>
                        </div>

                        {/* Nút submit trỏ đến form */}
                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={loading}
                            className={`w-full btn-primary py-4 text-lg shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition-transform ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartCheckoutPage;