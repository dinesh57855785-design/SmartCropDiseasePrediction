/**
 * services/api.js
 * Axios instance pre-configured for the Django REST API.
 * Automatically attaches JWT access token and refreshes it on 401.
 */

import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1';
  return `http://${host}:8000/api`;
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (auto-refresh on 401) ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', data.access);
        processQueue(null, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  register: (data) => api.post('/users/register/', data),
  getProfile: () => api.get('/users/profile/'),
};

// ─── OTP Endpoints ─────────────────────────────────────────────────────────────
export const otpAPI = {
  send: (payload) => api.post('/users/otp/send/', typeof payload === 'string' ? (payload.includes('@') ? { email: payload } : { phone: payload }) : payload),
  verify: (payload, otp_code) => api.post('/users/otp/verify/', typeof payload === 'string' ? (payload.includes('@') ? { email: payload, otp_code } : { phone: payload, otp_code }) : { ...payload, otp_code }),
  loginEmail: (email, otp_code) => api.post('/users/otp/login/', { email, otp_code }),
  loginPhone: (phone, otp_code) => api.post('/users/otp/login/', { phone, otp_code }),
};

// ─── Disease Endpoints ─────────────────────────────────────────────────────────
export const diseaseAPI = {
  predict: (formData) =>
    api.post('/disease/predict/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: () => api.get('/disease/history/'),
};

// ─── Dashboard Endpoints ───────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
};

// ─── Crop Endpoints ────────────────────────────────────────────────────────────
export const cropAPI = {
  list: () => api.get('/crop/'),
};

// ─── Disease Info Endpoints ────────────────────────────────────────────────────
export const diseaseInfoAPI = {
  list: (crop) => api.get('/disease/info/', { params: crop ? { crop } : {} }),
  getByKey: (key) => api.get(`/disease/info/${key}/`),
};

// ─── Weather Endpoints ─────────────────────────────────────────────────────────
export const weatherAPI = {
  getForecast: (lat, lon) => api.get('/weather/forecast/', { params: { lat, lon } }),
  getPlanner: (data) => api.post('/weather/planner/', data),
};

// ─── Advisor Endpoints ─────────────────────────────────────────────────────────
export const advisorAPI = {
  getCropGrowth: (crop, stage) => api.post('/advisor/crop-growth/', { crop, stage }),
  generateReport: (data) => api.post('/advisor/report/', data),
  analyzeSoil: (data) => api.post('/advisor/soil/', data),
  analyzeWater: (data) => api.post('/advisor/water/', data),
  getUnifiedRecommendation: (data) => api.post('/advisor/recommend/', data),
  getNeedToDo: (data) => api.post('/advisor/need-to-do/', data),
  getSeasonalSuggestions: (data) => api.post('/advisor/seasonal/', data),
  // AI Image Analysis
  analyzeSoilImage: (formData) =>
    api.post('/advisor/soil-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeWaterImage: (formData) =>
    api.post('/advisor/water-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Soil_Data_V3 Image-Based Classifier (real MobileNetV2 model)
  analyzeSoilImageV2: (formData) =>
    api.post('/advisor/soil-image-v2/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Chatbot Endpoints ─────────────────────────────────────────────────────────
export const chatbotAPI = {
  sendMessage: (message, context) => api.post('/chatbot/message/', { message, context }),
};

// ─── IoT Sensor Telemetry Endpoints ────────────────────────────────────────────
export const iotAPI = {
  getLatest: () => api.get('/sensor-data/latest/'),
  getHistory: (limit = 20) => api.get('/sensor-data/history/', { params: { limit } }),
  sendReading: (data) => api.post('/sensor-data/', data),
  getPumpConfig: () => api.get('/sensor-data/pump-config/'),
  updatePumpConfig: (data) => api.post('/sensor-data/pump-config/', data),
};

export default api;

