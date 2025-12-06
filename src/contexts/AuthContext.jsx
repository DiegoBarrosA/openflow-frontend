import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Role constants
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

const AuthContext = createContext(null);

/**
 * Decode a JWT token and extract the payload.
 * @param {string} token - JWT token string
 * @returns {object|null} Decoded payload or null if invalid
 */
function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
}

/**
 * Extract role from JWT token.
 * @param {string} token - JWT token string
 * @returns {string} Role (ADMIN or USER)
 */
function extractRoleFromToken(token) {
  const payload = decodeToken(token);
  if (payload && payload.role) {
    return payload.role;
  }
  return ROLES.USER; // Default to USER if no role claim
}

/**
 * Check if token is expired.
 * @param {string} token - JWT token string
 * @returns {boolean} True if expired
 */
function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    
    if (token && username) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Clear expired token
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setUser(null);
      } else {
        // Extract role from token (more reliable than localStorage)
        const role = extractRoleFromToken(token) || storedRole || ROLES.USER;
        setUser({ username, role, token });
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Login with token, username, and optional role.
   */
  const login = useCallback((token, username, role = null) => {
    // Extract role from token if not provided
    const userRole = role || extractRoleFromToken(token) || ROLES.USER;
    
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', userRole);
    
    setUser({ username, role: userRole, token });
  }, []);

  /**
   * Logout and clear all auth state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  }, []);

  /**
   * Check if user is authenticated.
   */
  const isAuthenticated = useCallback(() => {
    return user !== null && user.token && !isTokenExpired(user.token);
  }, [user]);

  /**
   * Check if user has ADMIN role.
   */
  const isAdmin = useCallback(() => {
    return user?.role === ROLES.ADMIN;
  }, [user]);

  /**
   * Check if user has USER role (normal user).
   */
  const isUser = useCallback(() => {
    return user?.role === ROLES.USER;
  }, [user]);

  /**
   * Check if user has any of the specified roles.
   * @param {string[]} roles - Array of role strings
   */
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  /**
   * Get the current user's role.
   */
  const getRole = useCallback(() => {
    return user?.role || null;
  }, [user]);

  /**
   * Get the current user's username.
   */
  const getUsername = useCallback(() => {
    return user?.username || null;
  }, [user]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isUser,
    hasAnyRole,
    getRole,
    getUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 * @returns {object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

