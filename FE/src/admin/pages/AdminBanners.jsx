import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho form
    const [editId, setEditId] = useState(null); // ID của banner đang sửa
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        try {
            const res = await apiClient.get('/admin/banners');
            setBanners(res.data);
        } catch (error) { console.error("Lỗi:", error); }
        finally { setLoading(false); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Hàm khi bấm nút Sửa
    const handleEdit = (banner) => {
        setEditId(banner.id);
        setTitle(banner.title || '');
        setLinkUrl(banner.link_url || '');
        setPreview(banner.full_image_url); // Hiển thị ảnh cũ để xem trước
        setImage(null); // Reset file chọn mới
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditId(null);
        setTitle(''); setLinkUrl(''); setImage(null); setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('link_url', linkUrl);
        if (image) formData.append('image', image);
        formData.append('is_active', 1);

        try {
            if (editId) {
                // Laravel yêu cầu dùng _method="PUT" khi gửi file qua POST
                formData.append('_method', 'PUT');
                await apiClient.post(`/admin/banners/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Cập nhật banner thành công!");
            } else {
                if (!image) return alert("Vui lòng chọn ảnh!");
                await apiClient.post('/admin/banners', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Thêm banner mới thành công!");
            }
            resetForm();
            fetchBanners();
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) return;
        try {
            await apiClient.delete(`/admin/banners/${id}`);
            fetchBanners();
        } catch (error) { alert("Lỗi khi xóa!"); }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Đang tải dữ liệu...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold mb-8">Quản lý Banner Quảng cáo</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM THÊM / SỬA */}
                <form onSubmit={handleSubmit} className={`p-6 rounded-3xl border transition-all h-fit shadow-sm ${editId ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                    <h2 className="font-bold text-lg mb-4 text-gray-800">
                        {editId ? `Đang sửa: ${title}` : 'Thêm Banner Mới'}
                    </h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Tiêu đề banner" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="Link liên kết (URL)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center bg-gray-50/50">
                            {preview ? (
                                <img src={preview} className="w-full h-32 object-cover rounded-xl mb-3 shadow-sm" alt="Preview" />
                            ) : (
                                <div className="py-8 text-gray-400">
                                    <svg className="w-10 h-10 mx-auto mb-2 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
                                    <p className="text-xs">Chưa chọn hình ảnh</p>
                                </div>
                            )}
                            <input type="file" onChange={handleFileChange} className="text-xs text-gray-500 w-full" accept="image/*" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <button disabled={isSubmitting} className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all ${editId ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}>
                                {isSubmitting ? 'Đang xử lý...' : (editId ? 'Lưu thay đổi' : 'Tải lên ngay')}
                            </button>
                            {editId && (
                                <button type="button" onClick={resetForm} className="text-sm text-gray-500 font-medium py-2 hover:underline">Hủy bỏ</button>
                            )}
                        </div>
                    </div>
                </form>

                {/* DANH SÁCH BANNER */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map(b => (
                        <div key={b.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group relative flex flex-col h-fit">
                            <div className="relative h-44 overflow-hidden">
                                <img src={b.full_image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={b.title} />
                            </div>
                            <div className="p-4 flex justify-between items-center bg-white">
                                <div className="overflow-hidden">
                                    <p className="font-bold text-gray-800 truncate text-sm">{b.title || 'Không tiêu đề'}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{b.link_url || 'Không có link'}</p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                    <button onClick={() => handleEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-xs">SỬA</button>
                                    <button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg font-bold text-xs">XÓA</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminBanners;