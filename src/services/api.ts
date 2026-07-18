import axios, { InternalAxiosRequestConfig } from 'axios';
import { showMessage } from 'react-native-flash-message';
import { localStorage } from '../utils/localStorage';
import { logoutUser } from './auth';
import { Config } from '../utils';

export const api = axios.create({
  baseURL: Config.API_URL,
  timeout: Config.TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

declare module 'axios' {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & { requiresAuth?: boolean }) => {
    if (!config.baseURL) {
      console.warn(
        "API Warning: baseURL tanımlı değil! .env dosyanızı ve Metro'yu kontrol edin.",
      );
    }

    if (config.requiresAuth) {
      const token = localStorage.getString('authToken');

      if (!token) {
        // Eğer auth gerekliyse ve token yoksa isteği hiç atmadan reddediyoruz
        return Promise.reject({
          message: 'AUTH_TOKEN_MISSING',
          isCustomError: true,
        });
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,
  async error => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.isCustomError) {
      console.log('İstek atılmadı:', error.message);
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.warn('Oturum geçersiz (401).');
        showMessage({
          message: 'Oturum Süresi Doldu',
          description: 'Güvenliğiniz için lütfen tekrar giriş yapın.',
          type: 'danger',
          icon: 'info',
        });
        logoutUser();
      } else if (status >= 500) {
        showMessage({
          message: 'Sunucu Hatası',
          description:
            'Şu an sunucularımıza ulaşılamıyor, lütfen sonra tekrar deneyin.',
          type: 'warning',
        });
      }
    } else if (error.request) {
      // 1. İsteğin iptal edilip edilmediğini veya timeout olup olmadığını kontrol et
      const isTimeout = error.code === 'ECONNABORTED';
      const isNetworkError = error.message === 'Network Error';

      // Sadece gerçekten cevap alınamayan durumlarda mesaj göster
      // Sessizce logla, her milisaniyelik kesintide kullanıcıyı darlama
      if (isNetworkError || isTimeout) {
        console.log('📡 Ağ Gecikmesi/Hatası:', error.config?.url);
      }
    } else if (
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error'
    ) {
      showMessage({
        message: 'Bağlantı Hatası',
        description: 'Lütfen internet bağlantınızı kontrol edin.',
        type: 'info',
      });
    }

    return Promise.reject(error);
  },
);
