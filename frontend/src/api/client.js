import axios from 'axios';
import { getMockResponse } from './mockFallback';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    // If accessed across LAN (e.g. 192.168.x.x, 10.x.x.x), dynamically use that host IP
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('vercel.app')) {
      return `http://${host}:8000/api`;
    }
  }
  return 'http://localhost:8000/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
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
// 2. If network error occurs (e.g. Vercel deployment before backend is hosted, or accessing on another device)
//    -> serves dynamic, interactive mock data with full CRUD persistence!
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      const mock = getMockResponse(error.config);
      if (mock) {
        console.warn(`[SkillBridge] Backend offline/remote. Serving fallback response for: ${error.config.url}`);
        return Promise.resolve(mock);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
