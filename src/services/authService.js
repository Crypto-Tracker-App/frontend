import { USER_SERVICE_URL } from '../config';

const API_BASE_URL = USER_SERVICE_URL;

// Helper function to make authenticated requests
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
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

export const AuthService = {
  // Register a new user
  register: async (username, password) => {
    try {
      const response = await makeRequest('/api/register', 'POST', {
        username,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (username, password) => {
    try {
      const response = await makeRequest('/api/login', 'POST', {
        username,
        password,
      });

      // Store JWT token if provided
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await makeRequest('/api/logout', 'POST');
      // Clear stored auth token
      localStorage.removeItem('authToken');
      return response;
    } catch (error) {
      // Still clear auth token even if logout request fails
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  // Verify JWT token validity
  verifySession: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/verify-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Session verification error:', error);
      throw error;
    }
  },

  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await makeRequest('/api/current-user', 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AuthService;
