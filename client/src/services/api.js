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

export const authAPI = {
  login: (username, password) => api.post('/api/auth/login', { username, password }),
  register: (username, email, password) => api.post('/api/auth/register', { username, email, password }),
  getCurrentUser: () => api.get('/api/auth/current-user'),
};

export const characterAPI = {
  create: (characterData) => api.post('/api/character', characterData),
  get: () => api.get('/api/character'),
  update: (characterData) => api.put('/api/character', characterData),
  equipItem: (charItemId) => api.post('/api/character/equip', { charItemId }),
  addItem: (gameItemId, quantity) => api.post('/api/character/addItem', { gameItemId, quantity }), //Не найдено в проекте
  removeItem: (itemId) => api.delete(`/api/character/removeItem/${itemId}`),
  getHealth: () => api.get('/api/character/health'), //Не используется в проекте
  damage: (damage) => api.post('/api/character/damage', { damage }), //Не найдено в проекте
  getStatus: () => api.get('/api/status'),
  updateStatus: (statusType, newStatus) => api.put('/api/status', { statusType, newStatus }),
};

export const gameItemAPI = {
  getAll: () => api.get('/api/gameItem'),
  get: (id) => api.get(`/api/gameItem/${id}`),
  create: (itemData) => api.post('/api/gameItem', itemData),
  update: (id, itemData) => api.put(`/api/gameItem/${id}`, itemData),
  delete: (id) => api.delete(`/api/gameItem/${id}`),
  send: (gameItemId, characterId, quantity) => api.post('/api/gameItem/send', { gameItemId, characterId, quantity }),
};

export const charItemAPI = {
  get: (id) => api.get(`/api/charItem/${id}`), //Не найдено в проекте
  update: (id, itemData) => api.put(`/api/charItem/${id}`, itemData),
  delete: (id) => api.delete(`/api/charItem/${id}`),
};

export default api;