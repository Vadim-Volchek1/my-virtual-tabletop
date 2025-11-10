import api from './api/index';

export const profileAPI = {
  // 🔹 Получить профиль текущего пользователя
  getProfile: async () => {
    try {
      const res = await api.get('/profile/me');
      return res.data;
    } catch (error) {
      console.error('❌ getProfile error:', error);
      throw error.response?.data || { message: 'Не удалось загрузить профиль' };
    }
  },

  // 🔹 Обновить профиль
  updateProfile: async (updates) => {
    try {
      const res = await api.put('/profile/me', updates);
      return res.data;
    } catch (error) {
      console.error('❌ updateProfile error:', error);
      throw error.response?.data || { message: 'Ошибка обновления профиля' };
    }
  },
};
