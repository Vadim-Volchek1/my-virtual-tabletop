import api from './api/index';

// ✅ API для авторизации и регистрации пользователей
export const authAPI = {
  // 🔹 Проверка авторизации текущего пользователя
  getCurrentUser: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (error) {
      console.error('❌ getCurrentUser error:', error);
      throw error.response?.data || { message: 'Auth check failed' };
    }
  },

  // 🔹 Логин пользователя
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const data = res.data;

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  // 🔹 Регистрация нового пользователя
  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const data = res.data;

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  // 🔹 Логаут пользователя
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }
};
