import apiClient from './apiClient';

export const getProducts = async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
};

export const getProductBySlug = async (slug) => {
    const response = await apiClient.get(`/products/${slug}`);
    return response.data;
};

export const getCategories = async () => {
    const response = await apiClient.get('/categories');
    return response.data;
};

// Bổ sung hàm này để ProductDetailPage.jsx có thể gọi được
export const getProductById = async (idOrSlug) => {
    const response = await apiClient.get(`/products/${idOrSlug}`);
    return response.data;
};