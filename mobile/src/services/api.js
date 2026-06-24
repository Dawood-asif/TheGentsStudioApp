// mobile/src/services/api.js
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export const tierService = {
  getTiers: async () => {
    const response = await api.get('/tiers');
    return response.data.data;
  },
  
  getTierForPoints: async (points) => {
    const response = await api.get(`/tiers/current/${points}`);
    return response.data.data;
  }
};

export default api;