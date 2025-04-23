import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  // Products
  getProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProduct: async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products`, productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Inventory
  getInventory: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
  },

  getExpiringInventory: async (days = 30) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/expiring?days=${days}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching expiring inventory:", error);
      throw error;
    }
  },

  // Discount Rules
  getDiscountRules: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/discount-rules`);
      return response.data;
    } catch (error) {
      console.error("Error fetching discount rules:", error);
      throw error;
    }
  },

  createDiscountRule: async (ruleData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/discount-rules`, ruleData);
      return response.data;
    } catch (error) {
      console.error("Error creating discount rule:", error);
      throw error;
    }
  },

  updateDiscountRule: async (ruleId, ruleData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/discount-rules/${ruleId}`, ruleData);
      return response.data;
    } catch (error) {
      console.error("Error updating discount rule:", error);
      throw error;
    }
  },

  deleteDiscountRule: async (ruleId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/discount-rules/${ruleId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting discount rule:", error);
      throw error;
    }
  },

  // Discounts
  calculateDiscounts: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/discounts/calculate`);
      return response.data;
    } catch (error) {
      console.error("Error calculating discounts:", error);
      throw error;
    }
  },

  overrideDiscount: async (productId, discountData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/discounts/${productId}/override`, discountData);
      return response.data;
    } catch (error) {
      console.error("Error overriding discount:", error);
      throw error;
    }
  },

  getDiscountAnalytics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/discounts/analytics`);
      return response.data;
    } catch (error) {
      console.error("Error fetching discount analytics:", error);
      throw error;
    }
  }
};

export default api;
