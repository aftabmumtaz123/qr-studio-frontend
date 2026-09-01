import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// QR Code APIs
export const qrAPI = {
  create: (data) => api.post('/qr', data),
  getAll: (params) => api.get('/qr', { params }),
  getById: (id) => api.get(`/qr/${id}`),
  update: (id, data) => api.put(`/qr/${id}`, data),
  delete: (id) => api.delete(`/qr/${id}`),
  toggle: (id) => api.patch(`/qr/${id}/toggle`),
};

// Analytics APIs
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
