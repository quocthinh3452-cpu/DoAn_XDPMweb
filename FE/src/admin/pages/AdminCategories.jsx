import React, { useEffect, useState } from 'react';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../services/adminService';

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Form
    const [editId, setEditId] = useState(null); // Nếu có ID là đang ở chế độ SỬA
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [parentId, setParentId] = useState('');
    const [isActive, setIsActive] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const data = await getAdminCategories();
            setCategories(data);
        } catch (error) { console.error("Lỗi:", error); }
        finally { setLoading(false); }
    };

    // Khi bấm nút Sửa trên bảng
    const handleEditClick = (cat) => {
        setEditId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setParentId(cat.parent_id || '');
        setIsActive(cat.is_active);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Hủy chế độ sửa
    const resetForm = () => {
        setEditId(null);
        setName(''); setSlug(''); setParentId(''); setIsActive(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = { name, slug, parent_id: parentId || null, is_active: isActive };
            
            if (editId) {
                await updateCategory(editId, payload);
                alert("Cập nhật thành công!");
            } else {
                await createCategory(payload);
                alert("Thêm mới thành công!");
            }
            resetForm();
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra.");
        } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
        try {
            await deleteCategory(id);
            alert("Đã xóa!");
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi xóa danh mục.");
        }
    };

    if (loading) return <div className="text-center py-20 animate-pulse font-medium text-xl">Đang tải...</div>;

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Quản lý Danh mục</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* FORM (Dùng chung Thêm/Sửa) */}
                <div className="w-full md:w-1/3">
                    <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${editId ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                        <h2 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">
                            {editId ? `Đang sửa: ${name}` : 'Thêm Danh mục mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên danh mục *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-gray-500" placeholder="Tự động tạo nếu để trống" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Danh mục cha</label>
                                <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200">
                                    <option value="">-- Gốc --</option>
                                    {categories.filter(c => c.id !== editId).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                <select value={isActive} onChange={(e) => setIsActive(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200">
                                    <option value={1}>Hiện</option>
                                    <option value={0}>Ẩn</option>
                                </select>
                            </div>
                            
                            <div className="flex flex-col gap-2 pt-2">
                                <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${editId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {isSubmitting ? 'Đang lưu...' : (editId ? 'Lưu thay đổi' : '+ Thêm danh mục')}
                                </button>
                                {editId && (
                                    <button type="button" onClick={resetForm} className="w-full py-2 text-gray-500 font-medium hover:underline">Hủy bỏ</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* BẢNG DANH SÁCH */}
                <div className="w-full md:w-2/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <tr>
                                    <th className="p-4 font-semibold">Tên / Slug</th>
                                    <th className="p-4 font-semibold text-center">Trạng thái</th>
                                    <th className="p-4 font-semibold text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">{cat.name}</p>
                                            <p className="text-xs text-gray-400">{cat.slug}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {cat.is_active ? 'Hiện' : 'Ẩn'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    Sửa
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminCategories;