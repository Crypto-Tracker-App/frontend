import { PORTFOLIO_SERVICE_URL } from '../config';

const API_BASE_URL = PORTFOLIO_SERVICE_URL;

// Helper function to make requests to portfolio service
const makeRequest = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Add JWT token from localStorage if available
  const token = localStorage.getItem('authToken');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.error('PortfolioService - No auth token found in localStorage');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PortfolioService - Error response:', {
        status: response.status,
        errorData,
        endpoint,
        hasToken: !!token
      });
      throw new Error(errorData.message || errorData.error || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

export const PortfolioService = {
  // Get total net holding value for the current user
  getTotalNetHolding: async () => {
    try {
      const response = await makeRequest('/api/total', 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add a new holding to the portfolio
  // coin_id: CoinGecko coin id (e.g., bitcoin, ethereum)
  // amount: Amount of the coin to add
  addHolding: async (coinId, amount) => {
    try {
      const response = await makeRequest('/api/add', 'POST', {
        coin_id: coinId,
        amount: amount,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove a holding from the portfolio
  // coin_id: CoinGecko coin id (e.g., bitcoin, ethereum)
  removeHolding: async (coinId) => {
    try {
      const response = await makeRequest('/api/remove', 'POST', {
        coin_id: coinId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default PortfolioService;
