import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function ProductCard({ product }) {
    const { addToCart } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleAddToCart = (e) => {
        e.preventDefault(); // Ngăn trình duyệt chuyển trang khi bấm nút thêm giỏ hàng
        
        addToCart({
            product_id: product.id,
            name: product.name,
            price: product.sale_price || product.regular_price,
            image: product.primary_image?.image_url || product.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
            color: product.colors?.[0] || null,
            storage: product.storage?.[0] || null,
            quantity: 1
        });
        alert('Đã thêm vào giỏ hàng!');
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col group">
            <Link to={`/products/${product.slug}`} className="flex-grow">
                <div className="overflow-hidden rounded-lg mb-4 bg-gray-50 flex justify-center items-center h-56">
                    <img 
                        src={product.primary_image?.image_url || product.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image'} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 min-h-[3.5rem] hover:text-blue-600">
                    {product.name}
                </h3>
                
                <div className="mt-3 flex flex-col gap-1 mb-4">
                    <span className="text-xl font-bold text-red-600">
                        {formatPrice(product.sale_price || product.regular_price)}
                    </span>
                    {product.sale_price && (
                        <span className="text-sm line-through text-gray-400">
                            {formatPrice(product.regular_price)}
                        </span>
                    )}
                </div>
            </Link>
            
            <button 
                onClick={handleAddToCart}
                className="w-full btn-primary mt-auto"
            >
                Thêm vào giỏ
            </button>
        </div>
    );
}

export default ProductCard;