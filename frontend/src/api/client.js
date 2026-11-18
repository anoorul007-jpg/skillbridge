import axios from 'axios';

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

// Intercept 401s and handle logout/refresh
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected route, let the app handle redirection
    }
    return Promise.reject(error);
  }
);

export default apiClient;
