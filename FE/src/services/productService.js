import axios from 'axios';

// Thiết lập URL cơ sở của Laravel
const API_URL = 'http://localhost:8000/api';

/**
 * GET /api/products
 * Lấy danh sách sản phẩm kèm bộ lọc (dùng cho trang danh sách sản phẩm)
 */
export async function getProducts(filters = {}) {
  try {
    // Axios sẽ tự động biến object filters thành query string: ?category=...&search=...
    const response = await axios.get(`${API_URL}/products`, { params: filters });
    return response.data; // Laravel trả về { data, total, totalPages }
  } catch (error) {
    console.error("Lỗi getProducts:", error);
    throw error;
  }
}

/**
 * GET /api/products/:id
 * Lấy chi tiết 1 sản phẩm (dùng cho trang ProductDetail)
 */
export async function getProductById(id) {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    
    // Lưu ý: Để khớp với HomePage.jsx đang dùng .then((r) => setData(r.data))
    // Chúng ta trả về cấu trúc { data: ... }
    return {
      data: response.data
    };
  } catch (error) {
    console.error(`Lỗi getProductById (${id}):`, error);
    throw error;
  }
}

/**
 * GET /api/categories
 * Lấy danh sách danh mục để đổ vào bộ lọc
 */
export async function getCategories() {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data; // Trả về mảng các danh mục
  } catch (error) {
    console.error("Lỗi getCategories:", error);
    throw error;
  }
}

/**
 * GET /api/products/featured
 * Lấy sản phẩm nổi bật cho trang chủ
 */
export async function getFeaturedProducts() {
  try {
    const response = await axios.get(`${API_URL}/home`);
    return {
      data: response.data.featured // Trả về mảng featured từ API homeData
    };
  } catch (error) {
    console.error("Lỗi getFeaturedProducts:", error);
    throw error;
  }
}