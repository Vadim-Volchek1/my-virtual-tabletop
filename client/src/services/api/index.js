import { apiInstance } from './axiosConfig';
import { setupInterceptors } from './interceptors';

// Создаем и настраиваем экземпляр API
const api = setupInterceptors(apiInstance);

export default api;