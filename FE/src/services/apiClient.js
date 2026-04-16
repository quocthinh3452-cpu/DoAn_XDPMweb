import axios from 'axios';

// ==========================================
// HÀM GIẢ LẬP DELAY (Khôi phục lại cho các service cũ)
// ==========================================
export const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// CẤU HÌNH AXIOS GỌI BACKEND
// ==========================================
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Trỏ vào backend Laravel
  headers: {
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techstore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized: Xóa token nếu hết hạn
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// Bắt buộc phải có dòng này ở cuối
export default apiClient;