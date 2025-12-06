import axios from 'axios';

// Use relative URL in production (proxied by nginx), full URL in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:31294/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 and 403 errors (authentication/authorization failures)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      // Only redirect if not already on login/register page or public pages
      const publicPaths = ['/login', '/register', '/public'];
      const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path));
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Azure AD login function
export const azureLogin = () => {
  // In production, OAuth endpoint is on the backend domain (api.openflow.world)
  // In development, it's on localhost
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // Derive backend URL from current hostname: app.openflow.world -> api.openflow.world
    const backendHost = window.location.hostname.replace('app.', 'api.');
    window.location.href = `https://${backendHost}/oauth2/authorization/azure`;
  } else {
    // Development - backend on localhost
    window.location.href = 'http://localhost:31294/oauth2/authorization/azure';
  }
};

// ==================== Public API (no authentication required) ====================

/**
 * Create a separate axios instance for public endpoints (no auth token).
 */
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all public boards.
 */
export const getPublicBoards = async () => {
  const response = await publicApi.get('/public/boards');
  return response.data;
};

/**
 * Get a public board by ID.
 * @param {number} id - Board ID
 */
export const getPublicBoard = async (id) => {
  const response = await publicApi.get(`/public/boards/${id}`);
  return response.data;
};

/**
 * Get statuses for a public board.
 * @param {number} boardId - Board ID
 */
export const getPublicBoardStatuses = async (boardId) => {
  const response = await publicApi.get(`/public/boards/${boardId}/statuses`);
  return response.data;
};

/**
 * Get tasks for a public board.
 * @param {number} boardId - Board ID
 */
export const getPublicBoardTasks = async (boardId) => {
  const response = await publicApi.get(`/public/boards/${boardId}/tasks`);
  return response.data;
};

// ==================== Role utilities ====================

/**
 * Decode a JWT token and extract the payload.
 * @param {string} token - JWT token string
 * @returns {object|null} Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
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
};

/**
 * Extract role from JWT token.
 * @param {string} token - JWT token string
 * @returns {string} Role (ADMIN or USER)
 */
export const extractRoleFromToken = (token) => {
  const payload = decodeToken(token);
  if (payload && payload.role) {
    return payload.role;
  }
  return 'USER'; // Default to USER if no role claim
};

export default api;

