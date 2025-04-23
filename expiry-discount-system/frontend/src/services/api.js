import axios from 'axios';

const API_BASE = '/api';  // thanks to proxy in package.json

export default {
  // Products
  getProducts: async () => {
    const { data } = await axios.get(`${API_BASE}/products`);
    return data;
  },
  createProduct: async (p) => {
    const { data } = await axios.post(`${API_BASE}/products`, p);
    return data;
  },

  // Inventory
  getInventory: async () => {
    const { data } = await axios.get(`${API_BASE}/inventory`);
    return data;
  },
  getExpiringInventory: async (days = 30) => {
    const { data } = await axios.get(`${API_BASE}/inventory?days=${days}`);
    return data;
  },
  createInventory: async (inv) => {
    const { data } = await axios.post(`${API_BASE}/inventory`, inv);
    return data;
  },

  // Discount Rules
  getDiscountRules: async () => {
    const { data } = await axios.get(`${API_BASE}/discount-rules`);
    return data;
  },
  createDiscountRule: async (r) => {
    const { data } = await axios.post(`${API_BASE}/discount-rules`, r);
    return data;
  },
  updateDiscountRule: async (id, r) => {
    const { data } = await axios.put(`${API_BASE}/discount-rules/${id}`, r);
    return data;
  },
  deleteDiscountRule: async (id) => {
    const { data } = await axios.delete(`${API_BASE}/discount-rules/${id}`);
    return data;
  },

  // Discounts
  calculateDiscounts: async () => {
    const { data } = await axios.post(`${API_BASE}/discounts/calculate`);
    return data;
  },
  getDiscountAnalytics: async () => {
    const { data } = await axios.get(`${API_BASE}/discounts/analytics`);
    return data;
  }
};