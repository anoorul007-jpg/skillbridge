import axios from 'axios';
import { getMockResponse } from './mockFallback';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('skillbridge_tokens');
    if (tokens) {
      try {
        const parsed = JSON.parse(tokens);
        if (parsed.access) {
          config.headers.Authorization = `Bearer ${parsed.access}`;
        }
      } catch (e) {
        console.error('Error parsing stored auth tokens', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Resilient response interceptor:
// 1. If backend responds -> returns live backend response
// 2. If network error occurs (e.g. Vercel deployment before backend is hosted) -> serves interactive demo data!
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      const mock = getMockResponse(error.config);
      if (mock) {
        console.warn(`[SkillBridge] Backend offline/unreachable. Serving fallback data for: ${error.config.url}`);
        return Promise.resolve(mock);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
