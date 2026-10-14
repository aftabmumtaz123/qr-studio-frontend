import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://qr-studio-backend.vercel.app/api'
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/+$/, ''),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export const qrAPI = {
  create: (data) => api.post('/qr', data),
  getAll: (params) => api.get('/qr', { params }),
  getById: (id) => api.get(`/ qr / ${ id } `),
  update: (id, data) => api.put(`/ qr / ${ id } `, data),
  delete: (id) => api.delete(`/ qr / ${ id } `),
  toggle: (id) => api.patch(`/ qr / ${ id }/toggle`),
};

export const analyticsAPI = {
  getByQR: (id) => api.get(`/analytics/${id}`),
  getOverview: () => api.get('/analytics/overview'),
};

export const shortURLAPI = {
  create: (data) => api.post('/short-urls', data),
  getAll: () => api.get('/short-urls'),
  update: (id, data) => api.put(`/short-urls/${id}`, data),
  toggle: (id) => api.patch(`/short-urls/${id}/toggle`),
  delete: (id) => api.delete(`/short-urls/${id}`),
};

export default api;
