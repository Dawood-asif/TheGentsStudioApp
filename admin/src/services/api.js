// admin/src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const tierService = {
  // Get all VIP tiers (live from backend)
  getTiers: async () => {
    const response = await api.get('/tiers');
    return response.data.data;
  },

  // Get current tier for a given points value
  getTierForPoints: async (points) => {
    const response = await api.get(`/tiers/current/${points}`);
    return response.data.data;
  },

  // Get stamps needed for free service
  getStampsForFreeService: () => {
    return 15; // hardcoded for now, will come from API eventually
  }
};

export default api;