import axios from 'axios';

// Thiết lập URL cơ sở của Laravel
const API_URL = 'http://localhost:8000/api';

/**
 * GET /api/home
 * Lấy toàn bộ dữ liệu trang chủ từ Laravel
 */
export async function getHomeData() {
  try {
    const response = await axios.get(`${API_URL}/home`);
    
    // Lưu ý: Cấu trúc trả về phải bọc trong { data: ... } 
    // vì HomePage.jsx của bạn đang gọi .then((r) => setData(r.data))
    return {
      data: response.data
    };
  } catch (error) {
    console.error("Lỗi gọi API getHomeData:", error);
    throw error;
  }
} 