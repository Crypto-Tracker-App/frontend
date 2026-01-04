
const API_BASE_URL = 'http://20.251.246.218/user-service';

// Helper function to make authenticated requests
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
      const response = await makeRequest('/register', 'POST', {
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
      const response = await makeRequest('/login', 'POST', {
        username,
        password,
      });

      // Store auth token if provided
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
      const response = await makeRequest('/logout', 'POST');
      // Clear stored auth data
      localStorage.removeItem('authToken');
      return response;
    } catch (error) {
      // Still clear auth data even if logout request fails
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  // Verify current session
  verifySession: async () => {
    try {
      const response = await makeRequest('/verify-session', 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await makeRequest('/current-user', 'GET');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default AuthService;
