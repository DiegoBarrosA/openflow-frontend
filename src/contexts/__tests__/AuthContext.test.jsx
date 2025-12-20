import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth, ROLES } from '../AuthContext';

// Helper to create a mock JWT token
function createMockToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

// Test component that uses the auth context
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="username">{auth.getUsername() || 'no-user'}</span>
      <span data-testid="role">{auth.getRole() || 'no-role'}</span>
      <span data-testid="authenticated">{auth.isAuthenticated() ? 'yes' : 'no'}</span>
      <span data-testid="isAdmin">{auth.isAdmin() ? 'yes' : 'no'}</span>
      <span data-testid="isUser">{auth.isUser() ? 'yes' : 'no'}</span>
      <button onClick={() => auth.login('test-token', 'testuser', 'USER')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should start with no user when localStorage is empty', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('username').textContent).toBe('no-user');
        expect(screen.getByTestId('authenticated').textContent).toBe('no');
      });
    });

    it('should load user from localStorage on mount', async () => {
      // Create a non-expired token
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createMockToken({ 
        sub: 'testuser', 
        role: 'ADMIN',
        exp: futureExp 
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('role', 'ADMIN');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('username').textContent).toBe('testuser');
        expect(screen.getByTestId('role').textContent).toBe('ADMIN');
      });
    });

    it('should clear expired token on mount', async () => {
      // Create an expired token
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken({ 
        sub: 'testuser', 
        role: 'USER',
        exp: pastExp 
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('role', 'USER');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('no');
        expect(localStorage.getItem('token')).toBeNull();
      });
    });
  });

  describe('Login', () => {
    it('should set user on login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('username').textContent).toBe('testuser');
        expect(screen.getByTestId('role').textContent).toBe('USER');
      });
    });

    it('should store credentials in localStorage on login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('role')).toBe('USER');
    });
  });

  describe('Logout', () => {
    it('should clear user on logout', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('role', 'USER');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByText('Logout');
      
      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('username').textContent).toBe('no-user');
        expect(screen.getByTestId('authenticated').textContent).toBe('no');
      });
    });

    it('should clear localStorage on logout', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('role', 'USER');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByText('Logout');
      
      await act(async () => {
        logoutButton.click();
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });
  });

  describe('Role Checking', () => {
    it('should correctly identify ADMIN role', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken({ role: 'ADMIN', exp: futureExp });
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', 'admin');
      localStorage.setItem('role', 'ADMIN');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAdmin').textContent).toBe('yes');
        expect(screen.getByTestId('isUser').textContent).toBe('no');
      });
    });

    it('should correctly identify USER role', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken({ role: 'USER', exp: futureExp });
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', 'user');
      localStorage.setItem('role', 'USER');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAdmin').textContent).toBe('no');
        expect(screen.getByTestId('isUser').textContent).toBe('yes');
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should return auth context when used inside AuthProvider', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isAdmin');
      expect(result.current).toHaveProperty('isUser');
      expect(result.current).toHaveProperty('hasAnyRole');
      expect(result.current).toHaveProperty('getRole');
      expect(result.current).toHaveProperty('getUsername');
    });
  });

  describe('ROLES Constants', () => {
    it('should export correct role constants', () => {
      expect(ROLES.ADMIN).toBe('ADMIN');
      expect(ROLES.USER).toBe('USER');
    });
  });
});

