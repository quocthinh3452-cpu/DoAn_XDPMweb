import apiClient from './apiClient';

export const createOrder = async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
};

export const getOrders = async () => {
    const response = await apiClient.get('/orders');
    return response.data;
};

export const getOrderDetails = async (orderCode) => {
    const response = await apiClient.get(`/orders/${orderCode}`);
    return response.data;
};