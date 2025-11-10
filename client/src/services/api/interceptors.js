export const setupInterceptors = (apiInstance) => {
  // 🔹 Добавляем токен в каждый запрос
  
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      console.log('🧩 INTERCEPTOR: token from localStorage =', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Добавлен токен в заголовок');
      } else {
        console.warn('⚠️ Токен не найден в localStorage');
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  

  // 🔹 Обрабатываем ответы сервера
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      if (status === 401) {
        console.warn('⚠️ Токен недействителен или истёк.');
        // Мягкая обработка: можно просто уведомить, без разлогина
        // Например, вызвать глобальное уведомление или показать модалку
        // showToast("Сессия истекла, пожалуйста, войдите заново.");

        // ❗Если хочешь всё-таки разлогинивать — делай это один раз, не во всех запросах подряд
        // localStorage.removeItem('token');
        // localStorage.removeItem('profile');
        // window.location.href = '/login';
      }

      if (status === 403) {
        console.warn('🚫 Недостаточно прав для этого действия.');
        // Здесь токен остаётся — пользователь просто не владелец объекта
      }

      return Promise.reject(error);
    }
  );

  return apiInstance;
};
