import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    // Nếu thành công, Laravel trả về { access_token, user, ... }
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    // Ném lỗi về cho Component xử lý hiển thị thông báo
    throw error.response?.data?.message || "Đăng nhập thất bại";
  }
};