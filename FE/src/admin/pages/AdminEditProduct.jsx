import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminProductById, updateProduct } from '../services/adminService';
import { getCategories } from '../../services/productService';

function AdminEditProduct() {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    const [formData, setFormData] = useState({
        name: '', sku: '', regular_price: '', category_id: '', description: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [specs, setSpecs] = useState([{ key: '', value: '' }]);

    useEffect(() => {
        // Tải danh mục và thông tin sản phẩm cùng lúc
        Promise.all([getCategories(), getAdminProductById(id)])
            .then(([cats, productData]) => {
                setCategories(cats);
                
                // Đổ dữ liệu cũ vào state
                setFormData({
                    name: productData.name || '',
                    sku: productData.sku || '',
                    regular_price: productData.regular_price || productData.sale_price || '',
                    category_id: productData.category_id || '',
                    description: productData.description || ''
                });

                // Xử lý ảnh cũ
                const existingImage = productData.primary_image?.image_url || productData.images?.[0]?.image_url;
                if (existingImage) setImagePreview(existingImage);

                // Xử lý thông số kỹ thuật cũ
                if (productData.attributes && productData.attributes.length > 0) {
                    const loadedSpecs = productData.attributes.map(attr => ({ key: attr.name, value: attr.value }));
                    setSpecs(loadedSpecs);
                }
            })
            .catch(error => {
                console.error(error);
                alert('Không tìm thấy sản phẩm!');
                navigate('/admin/products');
            })
            .finally(() => setFetching(false));
    }, [id, navigate]);

    const handleBasicChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
    const removeSpecRow = (index) => setSpecs(specs.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key] || ''));
        
        if (imageFile) dataToSend.append('image', imageFile);

        const validSpecs = specs.filter(s => s.key.trim() !== '' && s.value.trim() !== '');
        if (validSpecs.length > 0) {
            dataToSend.append('specifications', JSON.stringify(validSpecs));
        }

        try {
            await updateProduct(id, dataToSend);
            alert('Cập nhật sản phẩm thành công!');
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            alert('Lỗi: Cập nhật thất bại, vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-center py-20 text-gray-500 animate-pulse font-medium text-xl">Đang tải dữ liệu sản phẩm...</div>;

    // Giao diện (Tái sử dụng hoàn toàn từ AdminAddProduct)
    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-blue-600 font-medium">← Quay lại</button>
                <h1 className="text-3xl font-extrabold text-gray-900">Chỉnh Sửa Sản Phẩm</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* 1. HÌNH ẢNH */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. Hình ảnh sản phẩm</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative cursor-pointer hover:bg-gray-100">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-gray-500 text-center px-2">Click để đổi ảnh</span>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">Chọn ảnh mới nếu muốn thay đổi. Bỏ qua nếu giữ ảnh cũ.</p>
                        </div>
                    </div>
                </div>

                {/* 2. THÔNG TIN CƠ BẢN */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2">2. Thông tin cơ bản</h2>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sản phẩm *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleBasicChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mã sản phẩm (SKU) *</label>
                            <input required type="text" name="sku" value={formData.sku} onChange={handleBasicChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán (VNĐ) *</label>
                            <input required type="number" name="regular_price" value={formData.regular_price} onChange={handleBasicChange} min="0" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục *</label>
                        <select required name="category_id" value={formData.category_id} onChange={handleBasicChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white">
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả sản phẩm</label>
                        <textarea name="description" value={formData.description} onChange={handleBasicChange} rows="3" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"></textarea>
                    </div>
                </div>

                {/* 3. THÔNG SỐ KỸ THUẬT */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800">3. Thông số kỹ thuật</h2>
                        <button type="button" onClick={addSpecRow} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">+ Thêm</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {specs.map((spec, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input type="text" placeholder="Tên (VD: RAM)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} className="w-1/3 px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                                <input type="text" placeholder="Giá trị (VD: 8GB)" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                                <button type="button" onClick={() => removeSpecRow(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end sticky bottom-4">
                    <button type="submit" disabled={loading} className={`btn-primary px-10 py-3 shadow-lg shadow-blue-500/30 ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                        {loading ? 'Đang cập nhật...' : 'Cập Nhật Sản Phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminEditProduct;