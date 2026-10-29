import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  googleAuth: (data) => api.post('/auth/google', data),
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
};

export const chatAPI = {
  sendMessage: (message) => api.post('/chat/message', { message }),
  getHistory: (limit) => api.get('/chat/history', { params: { limit } }),
  clearHistory: () => api.delete('/chat/history'),
};

export const emotionAPI = {
  analyze: (text) => api.post('/emotion/analyze', { text }),
};

export const moodAPI = {
  record: (data) => api.post('/mood', data),
  get: (limit) => api.get('/mood', { params: { limit } }),
};

export const plannerAPI = {
  create: (data) => api.post('/planner', data),
  get: (limit) => api.get('/planner', { params: { limit } }),
};

export const recommendationAPI = {
  get: (data) => api.post('/recommendations', data),
  list: (limit) => api.get('/recommendations', { params: { limit } }),
};

export default api;
