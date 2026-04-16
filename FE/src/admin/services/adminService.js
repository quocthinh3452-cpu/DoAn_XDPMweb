import apiClient from '../../services/apiClient';

// ==============================
// THỐNG KÊ (DASHBOARD)
// ==============================
export const getDashboardData = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};

// ==============================
// QUẢN LÝ SẢN PHẨM (PRODUCTS)
// ==============================
export const getAdminProducts = async (params) => {
  const response = await apiClient.get('/admin/products', { params });
  return response.data;
};

// Alias để tương thích với code cũ nếu có gọi getProducts
export const getProducts = getAdminProducts; 

export const createProduct = async (formData) => {
  const response = await apiClient.post('/admin/products', formData);
  return response.data;
};

export const updateProduct = async (id, formData) => {
  formData.append('_method', 'PUT'); 
  const response = await apiClient.post(`/admin/products/${id}`, formData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/admin/products/${id}`);
  return response.data;
};

// ==============================
// QUẢN LÝ ĐƠN HÀNG (ORDERS)
// ==============================
export const getAdminOrders = async (params) => {
  const response = await apiClient.get('/admin/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

// ==============================
// QUẢN LÝ NGƯỜI DÙNG (USERS)
// ==============================
export const getAdminUsers = async (params) => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await apiClient.patch(`/admin/users/${id}/toggle-status`);
  return response.data;
};

// ==============================
// GOM LẠI THÀNH OBJECT DỰ PHÒNG
// ==============================
// Xuất thêm 1 object gom chung để tương thích với cú pháp "adminService.xyz"
export const adminService = {
  getDashboardData,
  getAdminProducts,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  toggleUserStatus
};