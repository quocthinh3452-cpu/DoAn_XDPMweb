import apiClient from '../../services/apiClient';

export const getDashboardStats = async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
};

export const getAdminOrders = async () => {
    const response = await apiClient.get('/admin/orders');
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
};

export const getAdminProducts = async () => {
    const response = await apiClient.get('/admin/products');
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await apiClient.post('/admin/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // Bắt buộc để gửi được File
        }
    });
    return response.data;
};

export const getAdminProductById = async (id) => {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
};

export const updateProduct = async (id, formData) => {
    // Dùng POST để tương thích với multipart/form-data trong Laravel
    const response = await apiClient.post(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// --- QUẢN LÝ DANH MỤC ---

export const getAdminCategories = async () => {
    const response = await apiClient.get('/admin/categories');
    return response.data;
};

export const createCategory = async (data) => {
    // Không cần multipart/form-data vì category hiện tại không có ảnh
    const response = await apiClient.post('/admin/categories', data);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
};