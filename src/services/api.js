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

// ==================== Notifications ====================

/**
 * Get all notifications for the current user.
 */
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Get unread notifications count.
 */
export const getUnreadNotificationCount = async () => {
  const response = await api.get('/notifications/unread/count');
  return response.data.count;
};

/**
 * Mark a notification as read.
 * @param {number} id - Notification ID
 */
export const markNotificationAsRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsAsRead = async () => {
  await api.put('/notifications/read-all');
};

// ==================== Subscriptions ====================

/**
 * Check if user is subscribed to an entity.
 * @param {string} entityType - TASK or BOARD
 * @param {number} entityId - Entity ID
 */
export const checkSubscription = async (entityType, entityId) => {
  const response = await api.get(`/subscriptions/${entityType}/${entityId}`);
  return response.data;
};

/**
 * Subscribe to an entity.
 * @param {string} entityType - TASK or BOARD
 * @param {number} entityId - Entity ID
 * @param {object} options - { emailEnabled: boolean, inAppEnabled: boolean }
 */
export const subscribe = async (entityType, entityId, options = {}) => {
  const response = await api.post(`/subscriptions/${entityType}/${entityId}`, options);
  return response.data;
};

/**
 * Unsubscribe from an entity.
 * @param {string} entityType - TASK or BOARD
 * @param {number} entityId - Entity ID
 */
export const unsubscribe = async (entityType, entityId) => {
  await api.delete(`/subscriptions/${entityType}/${entityId}`);
};

// ==================== Custom Fields ====================

/**
 * Get custom field definitions for a board.
 * @param {number} boardId - Board ID
 */
export const getCustomFieldDefinitions = async (boardId) => {
  const response = await api.get(`/custom-fields/definitions/board/${boardId}`);
  return response.data;
};

/**
 * Create a custom field definition.
 * @param {object} definition - Field definition data
 */
export const createCustomFieldDefinition = async (definition) => {
  const response = await api.post('/custom-fields/definitions', definition);
  return response.data;
};

/**
 * Update a custom field definition.
 * @param {number} id - Definition ID
 * @param {object} definition - Updated field definition data
 */
export const updateCustomFieldDefinition = async (id, definition) => {
  const response = await api.put(`/custom-fields/definitions/${id}`, definition);
  return response.data;
};

/**
 * Delete a custom field definition.
 * @param {number} id - Definition ID
 */
export const deleteCustomFieldDefinition = async (id) => {
  await api.delete(`/custom-fields/definitions/${id}`);
};

/**
 * Get custom field values for a task.
 * @param {number} taskId - Task ID
 */
export const getTaskCustomFieldValues = async (taskId) => {
  const response = await api.get(`/custom-fields/values/task/${taskId}`);
  return response.data;
};

/**
 * Set a custom field value for a task.
 * @param {number} taskId - Task ID
 * @param {number} fieldDefinitionId - Field definition ID
 * @param {string} value - Field value
 */
export const setTaskCustomFieldValue = async (taskId, fieldDefinitionId, value) => {
  const response = await api.put(`/custom-fields/values/task/${taskId}/field/${fieldDefinitionId}`, { value });
  return response.data;
};

/**
 * Set multiple custom field values for a task.
 * @param {number} taskId - Task ID
 * @param {object} fieldValues - Map of fieldDefinitionId -> value
 */
export const setTaskCustomFieldValues = async (taskId, fieldValues) => {
  const response = await api.put(`/custom-fields/values/task/${taskId}`, fieldValues);
  return response.data;
};

// ==================== Change History ====================

/**
 * Get change history for a task.
 * @param {number} taskId - Task ID
 */
export const getTaskHistory = async (taskId) => {
  const response = await api.get(`/history/tasks/${taskId}`);
  return response.data;
};

/**
 * Get change history for a board.
 * @param {number} boardId - Board ID
 */
export const getBoardHistory = async (boardId) => {
  const response = await api.get(`/history/boards/${boardId}`);
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

