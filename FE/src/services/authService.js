import apiClient from './apiClient';

/**
 * POST /api/auth/login
 */
export async function login({ email, password }) {
  const response = await apiClient.post('/auth/login', { email, password });
  
  // Phải bọc trong { data: ... } để khớp với logic của UserContext
  return { 
    data: { 
      user: response.data.user, 
      token: response.data.access_token 
    } 
  };
}

/**
 * POST /api/auth/register
 */
export async function register({ name, email, password, confirmPassword }) {
  const payload = {
    name,
    email,
    password,
    password_confirmation: confirmPassword || password 
  };

  const response = await apiClient.post('/auth/register', payload);
  
  // Tương tự, bọc trong { data: ... }
  return { 
    data: { 
      user: response.data.user, 
      token: response.data.access_token 
    } 
  };
}
/**
 * POST /api/auth/logout
 */
export async function logout() {
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

/**
 * GET /api/auth/me
 * Lấy thông tin user hiện tại dựa trên token
 */
export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}