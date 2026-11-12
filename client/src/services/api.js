import axios from 'axios';

// Base API URL configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Helper to extract clean error message
export const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.request && !error.response) {
    return 'Unable to connect to the ReturnIQ Lite server. Please verify backend is running on port 5000.';
  }
  return error.message || 'An unexpected error occurred';
};

// API Services
export const healthApi = {
  check: () => apiClient.get('/health')
};

export const dashboardApi = {
  getSummary: () => apiClient.get('/dashboard/summary')
};

export const productsApi = {
  getAll: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
  getAlerts: () => apiClient.get('/products/alerts'),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`)
};

export const returnsApi = {
  getAll: () => apiClient.get('/returns'),
  getById: (id) => apiClient.get(`/returns/${id}`),
  create: (data) => apiClient.post('/returns', data),
  delete: (id) => apiClient.delete(`/returns/${id}`)
};

export const settingsApi = {
  get: () => apiClient.get('/settings'),
  update: (data) => apiClient.put('/settings', data)
};

export const analyticsApi = {
  getSummary: () => apiClient.get('/analytics/summary')
};

export default apiClient;

