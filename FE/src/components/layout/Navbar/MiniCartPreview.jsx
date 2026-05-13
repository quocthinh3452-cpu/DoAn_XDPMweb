import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

function MiniCartPreview() {
    // Lấy đúng tên biến cartItems và hàm getCartTotal từ Context
    const { cartItems, getCartTotal } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Lấy tối đa 3 sản phẩm để hiển thị xem trước (thêm fallback [] để an toàn tuyệt đối)
    const previewItems = (cartItems || []).slice(0, 3);

    return (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">
                Giỏ hàng ({cartItems?.length || 0})
            </h3>
            
            {previewItems.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                    Giỏ hàng của bạn đang trống
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {previewItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-center">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 rounded" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                    {item.color} {item.storage ? `- ${item.storage}` : ''} x{item.quantity}
                                </p>
                                <p className="text-sm font-bold text-blue-600">{formatPrice(item.price)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {cartItems?.length > 3 && (
                <p className="text-xs text-center text-gray-500 mt-2">
                    Và {cartItems.length - 3} sản phẩm khác...
                </p>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-600">Tổng tiền:</span>
                    <span className="font-bold text-red-600">{formatPrice(getCartTotal())}</span>
                </div>
                <Link to="/cart" className="btn-primary block text-center py-2 w-full">
                    Xem giỏ hàng
                </Link>
            </div>
        </div>
    );
}

export default MiniCartPreview;