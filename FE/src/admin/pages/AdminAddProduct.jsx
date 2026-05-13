import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/adminService';
import { getCategories } from '../../services/productService';

function AdminAddProduct() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 1. State cho thông tin cơ bản
    const [formData, setFormData] = useState({
        name: '', sku: '', regular_price: '', category_id: '', description: ''
    });

    // 2. State cho File Ảnh
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // 3. State cho Thông số kỹ thuật (Mảng động)
    const [specs, setSpecs] = useState([{ key: '', value: '' }]);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    const handleBasicChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý khi chọn ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); // Tạo link xem trước ảnh
        }
    };

    // Các hàm xử lý mảng Thông số kỹ thuật
    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
    
    const removeSpecRow = (index) => {
        const newSpecs = specs.filter((_, i) => i !== index);
        setSpecs(newSpecs);
    };

    // Xử lý Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Đóng gói dữ liệu vào FormData để gửi File
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        
        if (imageFile) {
            dataToSend.append('image', imageFile);
        }

        // Lọc bỏ các dòng thông số trống và chuyển thành JSON string
        const validSpecs = specs.filter(s => s.key.trim() !== '' && s.value.trim() !== '');
        if (validSpecs.length > 0) {
            dataToSend.append('specifications', JSON.stringify(validSpecs));
        }

        try {
            await createProduct(dataToSend);
            alert('Đã thêm sản phẩm thành công!');
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            alert('Lỗi: Vui lòng kiểm tra lại thông tin!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-blue-600 font-medium">
                    ← Quay lại
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900">Thêm Sản Phẩm Mới</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* KHỐI 1: HÌNH ẢNH SẢN PHẨM */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. Hình ảnh sản phẩm</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative cursor-pointer hover:bg-gray-100 transition-colors">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-gray-500 text-center px-2">Click để tải ảnh lên</span>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">Tải lên hình ảnh đại diện cho sản phẩm. Kích thước tối đa 2MB.</p>
                            <p className="text-xs text-gray-400">Định dạng hỗ trợ: JPG, PNG, WEBP.</p>
                        </div>
                    </div>
                </div>

                {/* KHỐI 2: THÔNG TIN CƠ BẢN (Code cũ mang sang) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2">2. Thông tin cơ bản</h2>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sản phẩm *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleBasicChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" placeholder="VD: iPhone 16 Pro Max" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mã sản phẩm (SKU) *</label>
                            <input required type="text" name="sku" value={formData.sku} onChange={handleBasicChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none uppercase" placeholder="VD: IP16PM-256" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán (VNĐ) *</label>
                            <input required type="number" name="regular_price" value={formData.regular_price} onChange={handleBasicChange} min="0" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" placeholder="VD: 30000000" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục *</label>
                        <select required name="category_id" value={formData.category_id} onChange={handleBasicChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white cursor-pointer">
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả sản phẩm</label>
                        <textarea name="description" value={formData.description} onChange={handleBasicChange} rows="3" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none" placeholder="Nhập mô tả chi tiết..."></textarea>
                    </div>
                </div>

                {/* KHỐI 3: THÔNG SỐ KỸ THUẬT */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800">3. Thông số kỹ thuật</h2>
                        <button type="button" onClick={addSpecRow} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                            + Thêm thông số
                        </button>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {specs.map((spec, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input 
                                    type="text" placeholder="Tên (VD: RAM)" 
                                    value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} 
                                    className="w-1/3 px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm" 
                                />
                                <input 
                                    type="text" placeholder="Giá trị (VD: 8GB)" 
                                    value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} 
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm" 
                                />
                                <button type="button" onClick={() => removeSpecRow(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                        {specs.length === 0 && <p className="text-sm text-gray-500 italic text-center py-2">Chưa có thông số nào.</p>}
                    </div>
                </div>

                <div className="flex justify-end sticky bottom-4">
                    <button type="submit" disabled={loading} className={`btn-primary px-10 py-3 shadow-lg shadow-blue-500/30 ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                        {loading ? 'Đang lưu hệ thống...' : 'Lưu Sản Phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminAddProduct;