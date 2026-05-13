import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductBySlug } from '../services/productService';
import { useCart } from '../context/CartContext';

function ProductDetailPage() {
    const { slug } = useParams();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    // State lưu trữ Lựa chọn của khách hàng
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedStorage, setSelectedStorage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductBySlug(slug);
                setProduct(data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    // ==== THUẬT TOÁN XỬ LÝ THÔNG SỐ (ATTRIBUTES) ====
    const attributes = product?.attributes || [];
    
    // 1. Tìm thông số "Màu sắc" và "Dung lượng"
    const colorAttr = attributes.find(a => a.name.toLowerCase().includes('màu'));
    const storageAttr = attributes.find(a => a.name.toLowerCase().includes('dung lượng') || a.name.toLowerCase() === 'rom');
    
    // Tách chuỗi thành mảng các nút (VD: "Đỏ, Xanh" -> ['Đỏ', 'Xanh'])
    const colorOptions = colorAttr ? colorAttr.value.split(',').map(s => s.trim()) : [];
    const storageOptions = storageAttr ? storageAttr.value.split(',').map(s => s.trim()) : [];
    
    // 2. Lọc ra các thông số kỹ thuật chung (Loại bỏ Màu và Dung lượng khỏi bảng)
    const generalSpecs = attributes.filter(a => 
        !a.name.toLowerCase().includes('màu') && 
        !a.name.toLowerCase().includes('dung lượng') && 
        a.name.toLowerCase() !== 'rom'
    );

    // Tự động chọn Option đầu tiên mặc định khi load xong sản phẩm
    useEffect(() => {
        if (colorOptions.length > 0 && !selectedColor) setSelectedColor(colorOptions[0]);
        if (storageOptions.length > 0 && !selectedStorage) setSelectedStorage(storageOptions[0]);
    }, [product]);
    // ================================================

   const handleAddToCart = () => {
        addToCart({
            ...product,
            selected_color: selectedColor,
            selected_storage: selectedStorage,
            cart_quantity: quantity
        });
        
        // Bổ sung dòng thông báo này:
        alert('🎉 Đã thêm sản phẩm vào giỏ hàng thành công!'); 
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) return <div className="text-center py-32 text-xl font-medium text-gray-500 animate-pulse">Đang tải sản phẩm...</div>;
    if (!product) return <div className="text-center py-32 text-xl font-medium text-red-500">Không tìm thấy sản phẩm!</div>;

    const primaryImage = product.primary_image?.image_url || product.images?.[0]?.image_url || 'https://via.placeholder.com/400';

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-10">
                <div className="flex flex-col md:flex-row gap-12">
                    
                    {/* Cột trái: Hình ảnh */}
                    <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-gray-50 rounded-2xl">
                        <img src={primaryImage} alt={product.name} className="max-w-full h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300" />
                    </div>

                    {/* Cột phải: Thông tin đặt hàng */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                        <p className="text-sm text-gray-500 mb-6 uppercase tracking-wide font-medium">SKU: {product.sku}</p>
                        
                        <div className="text-3xl font-extrabold text-red-600 mb-8">
                            {formatPrice(product.sale_price || product.regular_price)}
                        </div>

                        {/* --- BỘ CHỌN DUNG LƯỢNG --- */}
                        {storageOptions.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 uppercase mb-3 tracking-wider">Dung lượng</h3>
                                <div className="flex flex-wrap gap-3">
                                    {storageOptions.map((opt, idx) => (
                                        <button 
                                            key={idx} onClick={() => setSelectedStorage(opt)}
                                            className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedStorage === opt ? 'border-blue-600 text-blue-700 bg-blue-50 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- BỘ CHỌN MÀU SẮC --- */}
                        {colorOptions.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-800 uppercase mb-3 tracking-wider">Màu sắc</h3>
                                <div className="flex flex-wrap gap-3">
                                    {colorOptions.map((opt, idx) => (
                                        <button 
                                            key={idx} onClick={() => setSelectedColor(opt)}
                                            className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedColor === opt ? 'border-blue-600 text-blue-700 bg-blue-50 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Khối thêm vào giỏ hàng */}
                        <div className="flex items-center gap-4 mt-auto">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-100 font-bold transition-colors">-</button>
                                <input type="number" value={quantity} readOnly className="w-12 text-center font-bold text-gray-900 focus:outline-none" />
                                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-100 font-bold transition-colors">+</button>
                            </div>
                            <button onClick={handleAddToCart} className="flex-1 btn-primary py-3.5 text-lg shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition-transform">
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BẢNG THÔNG SỐ KỸ THUẬT CHUNG --- */}
            {generalSpecs.length > 0 && (
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông số kỹ thuật chi tiết</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        {generalSpecs.map((spec, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row border-b border-gray-50 pb-3">
                                <span className="sm:w-2/5 text-gray-500 font-medium mb-1 sm:mb-0">{spec.name}</span>
                                <span className="sm:w-3/5 text-gray-900 font-semibold">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Mô tả sản phẩm */}
            {product.description && (
                <div className="mt-8 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Đặc điểm nổi bật</h2>
                    <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {product.description}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailPage;