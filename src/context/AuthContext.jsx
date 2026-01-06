import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check if user is already logged in by checking token
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          setHasToken(true);
          // Verify the token is still valid
          const response = await AuthService.verifySession();
          if (response.user) {
            setUser(response.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setHasToken(false);
          }
        }
      } catch (error) {
        // Token invalid or expired, clear any stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setHasToken(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const result = await AuthService.login(username, password);
      console.log('AuthContext - Login result:', { hasToken: !!result.token, hasUser: !!result.user });
      if (result.token && result.user) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        console.log('AuthContext - Token stored, first 30 chars:', result.token.substring(0, 30));
        setHasToken(true);
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, password) => {
    try {
      const result = await AuthService.register(username, password);
      if (result.message) {
        // After successful registration, auto-login the user
        const loginResult = await AuthService.login(username, password);
        if (loginResult.token && loginResult.user) {
          localStorage.setItem('authToken', loginResult.token);
          localStorage.setItem('user', JSON.stringify(loginResult.user));
          setHasToken(true);
          setUser(loginResult.user);
          return { success: true };
        }
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setHasToken(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
