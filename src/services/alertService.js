const API_BASE_URL = 'http://20.251.246.218/alert-service';

// Helper function to make requests to alert service
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
  console.log('AlertService - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN FOUND');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.error('AlertService - No auth token found in localStorage');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AlertService - Error response:', {
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

export const AlertService = {
  // Get all active alerts for the current user
  getAlerts: async () => {
    try {
      const response = await makeRequest('/api/alerts', 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create a new price alert
  // coin_id: CoinGecko coin id (e.g., bitcoin, ethereum)
  // threshold_price: Price at which to trigger the alert
  createAlert: async (coinId, thresholdPrice) => {
    try {
      const response = await makeRequest('/api/set-alert', 'POST', {
        coin_id: coinId,
        threshold_price: thresholdPrice,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete/deactivate an alert
  // alert_id: ID of the alert to delete
  deleteAlert: async (alertId) => {
    try {
      const response = await makeRequest(`/api/alerts/${alertId}`, 'DELETE');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AlertService;
