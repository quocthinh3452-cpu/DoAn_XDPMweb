import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartPage() {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    // Thay thế đoạn tính subtotal cũ bằng đoạn này
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
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-lg">
                <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
                    <Link to="/products" className="btn-primary px-8 py-3 rounded-xl inline-block">Tiếp tục mua sắm</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-10">Giỏ hàng</h1>
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Cột danh sách sản phẩm */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    {cartItems.map((item, index) => {
                        // Tự tính giá trực tiếp an toàn
                        const sale = parseFloat(item.sale_price);
                        const regular = parseFloat(item.regular_price);
                        const fallback = parseFloat(item.price);

                        let price = 0;
                        if (sale > 0) price = sale;
                        else if (regular > 0) price = regular;
                        else if (fallback > 0) price = fallback;

                        const qty = Number(item.cart_quantity) || Number(item.quantity) || 1;

                        // Đổi nguồn ảnh mặc định sang placehold.co để không bị nhà mạng chặn
                        const fallbackImage = 'https://placehold.co/150x150?text=No+Image';
                        const imgSrc = item.primary_image?.image_url || item.images?.[0]?.image_url || fallbackImage;

                        return (
                            <div key={index} className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <div className="w-24 h-24 bg-gray-50 rounded-2xl p-2 shrink-0">
                                    <img src={imgSrc} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                    {(item.selected_color || item.selected_storage) && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.selected_color} {item.selected_color && item.selected_storage && ' - '} {item.selected_storage}
                                        </p>
                                    )}
                                    <p className="text-red-600 font-bold mt-2">{formatPrice(price)}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-gray-100 rounded-xl bg-white overflow-hidden">
                                        <button onClick={() => updateQuantity && updateQuantity(item.id, item.selected_color, item.selected_storage, qty - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold transition-colors">-</button>
                                        <input type="number" value={qty} readOnly className="w-10 text-center font-bold text-gray-900 focus:outline-none" />
                                        <button onClick={() => updateQuantity && updateQuantity(item.id, item.selected_color, item.selected_storage, qty + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold transition-colors">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart && removeFromCart(item.id, item.selected_color, item.selected_storage)} className="text-red-500 hover:text-red-700 font-medium text-sm px-2">Xóa</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cột tổng cộng */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Tổng cộng</h2>
                        <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
                            <div className="flex justify-between text-gray-600 font-medium">
                                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 font-medium">
                                <span>Phí giao hàng</span>
                                <span className="text-green-600">Chưa tính</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-gray-800">Tổng thanh toán</span>
                            <span className="text-2xl font-extrabold text-red-600">{formatPrice(subtotal)}</span>
                        </div>
                        <button onClick={() => navigate('/checkout')} className="w-full btn-primary py-4 text-lg shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition-transform">
                            Tiến hành thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;