import axios from 'axios';
import { APP_SERVER_URL } from '../config/config';

const api = axios.create({
  baseURL: APP_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const auth = {
  login: (username, password) => api.post('/api/auth/login', { username, password }),
  register: (username, email, password) => api.post('/api/auth/register', { username, email, password }),
  getMe: () => api.get('/api/auth/me'),
};

export const character = {
  create: (characterData) => api.post('/api/character', characterData),
  get: () => api.get('/api/character'),
  update: (characterData) => api.put('/api/character', characterData),
  equipItem: (charItemId) => api.post('/api/character/equip', { charItemId }),
  addItem: (gameItemId, quantity) => api.post('/api/character/addItem', { gameItemId, quantity }),
  getHealth: () => api.get('/api/character/health'),
  damage: (damage) => api.post('/api/character/damage', { damage }),
};

export const gameItem = {
  getAll: () => api.get('/api/gameItem'),
  get: (id) => api.get(`/api/gameItem/${id}`),
  create: (itemData) => api.post('/api/gameItem', itemData),
  update: (id, itemData) => api.put(`/api/gameItem/${id}`, itemData),
  delete: (id) => api.delete(`/api/gameItem/${id}`),
  send: (gameItemId, characterId) => api.post(`/api/gameItem/send/${gameItemId}/${characterId}`),
};

export const charItem = {
  get: (id) => api.get(`/api/charItem/${id}`),
  update: (id, itemData) => api.put(`/api/charItem/${id}`, itemData),
  delete: (id) => api.delete(`/api/charItem/${id}`),
};

export default api;