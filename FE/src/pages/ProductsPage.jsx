import React, { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../services/productService';
import ProductCard from '../components/product/ProductCard';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(''); // Lưu slug danh mục đang chọn

    // Lấy dữ liệu ngay khi vào trang
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Gọi API lấy sản phẩm và danh mục cùng lúc cho nhanh
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Lỗi tải dữ liệu:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Hàm gọi lại API lấy sản phẩm khi click chọn danh mục
    const handleFilterCategory = async (slug) => {
        setSelectedCategory(slug);
        setLoading(true);
        try {
            // Truyền params category xuống backend (đã được cấu hình ở Bước 2)
            const data = await getProducts(slug ? { category: slug } : {});
            setProducts(data);
        } catch (error) {
            console.error('Lỗi lọc sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* Cột trái: Sidebar Danh mục */}
                <div className="w-full md:w-1/4 lg:w-1/5">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Danh mục</h3>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <button
                                    onClick={() => handleFilterCategory('')}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${selectedCategory === '' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                                >
                                    Tất cả sản phẩm
                                </button>
                            </li>
                            {categories.map(category => (
                                <li key={category.id}>
                                    <button
                                        onClick={() => handleFilterCategory(category.slug)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${selectedCategory === category.slug ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                                    >
                                        {category.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Cột phải: Lưới hiển thị Sản phẩm */}
                <div className="w-full md:w-3/4 lg:w-4/5">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {selectedCategory === '' ? 'Tất cả sản phẩm' : categories.find(c => c.slug === selectedCategory)?.name}
                        </h1>
                        <span className="text-gray-500 font-medium">{products.length} sản phẩm</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <p className="text-lg text-gray-500 font-medium animate-pulse">Đang tải sản phẩm...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white p-16 rounded-2xl text-center shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-lg">Không có sản phẩm nào trong danh mục này.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                // Tái sử dụng ProductCard
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}

export default ProductsPage;