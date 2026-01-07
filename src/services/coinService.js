const API_BASE_URL = 'http://20.251.246.218/pricing-service';


// Helper function to make requests to pricing service
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

export const CoinService = {
  // Get top coins by market cap rank
  // limit: Number of coins to return (default: 10, max: 100)
  // offset: Number of coins to skip for pagination (default: 0)
  getTopCoins: async (limit = 10, offset = 0) => {
    try {
      const params = new URLSearchParams({
        limit: Math.min(limit, 100), // Cap at 100
        offset,
      });
      const response = await makeRequest(`/api/top-coins?${params}`, 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get a single coin by its ID with metadata and market data
  // coin_id: CoinGecko coin id (e.g., bitcoin, ethereum)
  getCoinById: async (coinId) => {
    try {
      const response = await makeRequest(`/api/coin/${coinId}`, 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search for coins by name, ID, or symbol
  // query: Search query (e.g., bitcoin, btc, eth)
  // limit: Maximum number of results to return (default: 10, max: 100)
  searchCoins: async (query, limit = 10) => {
    try {
      if (!query || query.trim() === '') {
        return { status: 'success', data: null, count: 0 };
      }
      const params = new URLSearchParams({
        q: query.trim(),
        limit: Math.min(limit, 100),
      });
      const response = await makeRequest(`/api/search?${params}`, 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default CoinService;
