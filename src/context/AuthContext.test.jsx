import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock the AuthService
vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    verifySession: vi.fn(),
  },
}));

import AuthService from '../services/authService';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should initialize with no user and loading false', async () => {
    AuthService.verifySession.mockResolvedValue({});

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login successfully', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    const mockToken = 'test-token-123';

    AuthService.login.mockResolvedValue({
      token: mockToken,
      user: mockUser,
    });

    AuthService.verifySession.mockResolvedValue({});

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('testuser', 'password123');
    });

    expect(loginResult.success).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('authToken')).toBe(mockToken);
  });

  it('should handle login failure', async () => {
    AuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    AuthService.verifySession.mockResolvedValue({});

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('testuser', 'wrongpassword');
    });

    expect(loginResult.success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    const mockToken = 'test-token-123';

    AuthService.login.mockResolvedValue({
      token: mockToken,
      user: mockUser,
    });

    AuthService.logout.mockResolvedValue({});
    AuthService.verifySession.mockResolvedValue({});

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    await act(async () => {
      await result.current.login('testuser', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
