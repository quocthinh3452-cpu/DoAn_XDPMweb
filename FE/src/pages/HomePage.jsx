import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/productService';
import apiClient from '../services/apiClient';

// Import Swiper và các module cần thiết
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]); // ✅ ĐÃ THÊM DÒNG NÀY ĐỂ HẾT LỖI
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const IMAGE_BASE_URL = "https://techstore-api-eajk.onrender.com";
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi cả 3 API: Sản phẩm, Danh mục và Banner
                const [productsData, categoriesRes, bannersRes] = await Promise.all([
                    getProducts(),
                    apiClient.get('/categories'),
                    apiClient.get('/banners') // Lấy banner từ Database
                ]);
                
                setProducts(productsData);
                setCategories(categoriesRes.data);
                setBanners(bannersRes.data); // ✅ Lưu dữ liệu banner vào state
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            
            {/* ============ PHẦN 1: SLIDER QUẢNG CÁO (BANNER) ============ */}
            {!loading && banners.length > 0 && (
                <div className="mb-10 overflow-hidden rounded-3xl shadow-lg border border-gray-100">
                    <Swiper
                        spaceBetween={0}
                        centeredSlides={true}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                        }}
                        pagination={{ clickable: true }}
                        navigation={true}
                        modules={[Autoplay, Pagination, Navigation]}
                        className="mySwiper h-[300px] md:h-[450px]"
                    >
                        {banners.map((banner) => (
                            <SwiperSlide key={banner.id}>
                                <div className="relative w-full h-full">
                                    <img 
                                        src={banner.image_path ? `${IMAGE_BASE_URL}/storage/${banner.image_path}` : banner.full_image_url?.replace('http://127.0.0.1:8000', IMAGE_BASE_URL)} 
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {banner.title && (
                                        <div className="absolute bottom-10 left-10 bg-black/30 backdrop-blur-md p-6 rounded-2xl text-white">
                                            <h2 className="text-2xl font-bold">{banner.title}</h2>
                                        </div>
                                    )}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}

            {/* ============ PHẦN 2: DANH MỤC NỔI BẬT ============ */}
            {!loading && categories.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Danh Mục Nổi Bật
                    </h2>
                    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                        {categories.map(category => (
                            <Link 
                                key={category.id} 
                                to={`/products?category=${category.slug}`}
                                className="flex-shrink-0 bg-white border border-gray-100 hover:border-blue-300 hover:shadow-md px-6 py-4 rounded-2xl transition-all flex flex-col items-center gap-3 min-w-[140px]"
                            >
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                                    {category.name.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-700 text-sm">{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ============ PHẦN 3: SẢN PHẨM MỚI NHẤT ============ */}
            <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                Sản Phẩm Mới Nhất
            </h2>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <p className="text-lg text-gray-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col group relative">
                            <Link to={`/products/${product.slug}`} className="flex-grow">
                                <div className="overflow-hidden rounded-2xl mb-4 bg-gray-50 flex justify-center items-center h-56 p-4">
                                    <img
                                        src={(product.primary_image?.image_url || 'https://via.placeholder.com/300').replace('http://127.0.0.1:8000', IMAGE_BASE_URL)}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="text-md font-bold text-gray-800 line-clamp-2 min-h-[3rem] hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="mt-3 flex items-end gap-2 mb-4">
                                    <span className="text-lg font-extrabold text-red-600">
                                        {formatPrice(product.sale_price || product.regular_price)}
                                    </span>
                                </div>
                            </Link>
                            <button
                                onClick={() => {
                                    addToCart({ ...product, quantity: 1 });
                                    alert(`🎉 Đã thêm ${product.name} vào giỏ hàng!`);
                                }}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                            >
                                Thêm vào giỏ
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HomePage;