import apiClient from './apiClient';

export const login = async (credentials) => {
    const response = await apiClient.post('/login', credentials);
    // Nếu có token, lưu vào localStorage để duy trì đăng nhập
    if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await apiClient.post('/register', userData);
    if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = async () => {
    await apiClient.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
};

// Hàm tiện ích để lấy thông tin user hiện tại
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};