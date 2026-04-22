import axios from 'axios';

// Tạo một instance của axios với cấu hình mặc định
const axiosClient = axios.create({
    // Trong Vite, bắt buộc phải dùng import.meta.env để gọi biến môi trường
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Tự động huỷ request nếu quá 10 giây backend không phản hồi
});

// (Tùy chọn) Interceptor cho Request: Can thiệp trước khi gửi API đi
axiosClient.interceptors.request.use(
    (config) => {
        // Nơi lý tưởng để tự động gắn Token đăng nhập nếu có
        // const token = localStorage.getItem('access_token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// (Tùy chọn) Interceptor cho Response: Can thiệp sau khi nhận kết quả về
axiosClient.interceptors.response.use(
    (response) => {
        // Bóc tách thẳng data từ response trả về để các component không phải gọi .data nhiều lần
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Nơi lý tưởng để bắt lỗi chung (ví dụ: HTTP 401 thì tự động đẩy về trang Login)
        return Promise.reject(error);
    }
);

export default axiosClient;