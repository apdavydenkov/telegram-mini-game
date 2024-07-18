import axios from 'axios';
import { APP_SERVER_URL } from '../../config/config';

const api = axios.create({
  baseURL: APP_SERVER_URL,
});

api.interceptors.request.use(config => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  error => {
    console.error(`API Error: ${error.config.method.toUpperCase()} ${error.config.url} - ${error.message}`);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  makeAdmin: () => api.post('/api/auth/make-admin'),
};

export const characterAPI = {
  getCharacter: () => api.get('/api/character'),
  createCharacter: (characterData) => api.post('/api/character', characterData),
  updateCharacter: (characterData, version) => api.put('/api/character', { ...characterData, version }),
  equipItem: (charItemId, version) => api.post('/api/character/equip', { charItemId, version }),
  addItemToInventory: (itemData, version) => api.post('/api/character/addItem', { ...itemData, version }),
  getHealthData: () => api.get('/api/character/health'),
  damageCharacter: (damageData, version) => api.post('/api/character/damage', { ...damageData, version }),
};

export const gameItemAPI = {
  getAllItems: () => api.get('/api/gameItem'),
  getItemById: (id) => api.get(`/api/gameItem/${id}`),
  createItem: (itemData) => api.post('/api/gameItem', itemData),
  updateItem: (id, itemData) => api.put(`/api/gameItem/${id}`, itemData),
  deleteItem: (id) => api.delete(`/api/gameItem/${id}`),
  sendItemToCharacter: (gameItemId, characterId) => api.post(`/api/gameItem/send/${gameItemId}/${characterId}`),
};

export const charItemAPI = {
  getCharItemById: (id) => api.get(`/api/charItem/${id}`),
  updateCharItem: (id, itemData) => api.put(`/api/charItem/${id}`, itemData),
  deleteCharItem: (id) => api.delete(`/api/charItem/${id}`),
};