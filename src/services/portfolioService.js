const API_BASE_URL = 'http://20.251.246.218/portfolio-service';

// Helper function to make requests to portfolio service
const makeRequest = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session management
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Add auth token from localStorage if available
  const token = localStorage.getItem('authToken');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
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
      const response = await makeRequest('/total', 'GET');
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
      const response = await makeRequest('/add', 'POST', {
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
      const response = await makeRequest('/remove', 'POST', {
        coin_id: coinId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default PortfolioService;
