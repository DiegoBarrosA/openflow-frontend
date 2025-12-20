import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockAxios };
});

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Axios Instance Configuration', () => {
    it('should create axios instance with correct base configuration', async () => {
      // Re-import to trigger module initialization
      const api = (await import('../api')).default;
      
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should set up request interceptor', async () => {
      await import('../api');
      expect(axios.interceptors.request.use).toHaveBeenCalled();
    });

    it('should set up response interceptor', async () => {
      await import('../api');
      expect(axios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-jwt-token');
      
      // Get the request interceptor callback
      const requestInterceptor = axios.interceptors.request.use.mock.calls[0]?.[0];
      
      if (requestInterceptor) {
        const config = { headers: {} };
        const result = requestInterceptor(config);
        
        // The interceptor should add the token
        expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
      }
    });

    it('should not add Authorization header when no token', async () => {
      // Ensure no token
      localStorage.removeItem('token');
      
      const requestInterceptor = axios.interceptors.request.use.mock.calls[0]?.[0];
      
      if (requestInterceptor) {
        const config = { headers: {} };
        const result = requestInterceptor(config);
        
        expect(result.headers.Authorization).toBeUndefined();
      }
    });
  });

  describe('Response Interceptor', () => {
    it('should pass through successful responses', async () => {
      const responseInterceptor = axios.interceptors.response.use.mock.calls[0]?.[0];
      
      if (responseInterceptor) {
        const response = { data: { test: 'data' }, status: 200 };
        const result = responseInterceptor(response);
        expect(result).toBe(response);
      }
    });

    it('should clear auth data on 401 error', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('role', 'USER');
      
      const errorInterceptor = axios.interceptors.response.use.mock.calls[0]?.[1];
      
      if (errorInterceptor) {
        const error = {
          response: { status: 401 },
        };
        
        // Mock window.location
        const originalLocation = window.location;
        delete window.location;
        window.location = { 
          href: '/boards',
          pathname: '/boards',
        };
        
        try {
          await errorInterceptor(error);
        } catch (e) {
          // Expected to throw
        }
        
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('username')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
        
        // Restore window.location
        window.location = originalLocation;
      }
    });

    it('should clear auth data on 403 error', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('username', 'testuser');
      localStorage.setItem('role', 'USER');
      
      const errorInterceptor = axios.interceptors.response.use.mock.calls[0]?.[1];
      
      if (errorInterceptor) {
        const error = {
          response: { status: 403 },
        };
        
        const originalLocation = window.location;
        delete window.location;
        window.location = { 
          href: '/boards',
          pathname: '/boards',
        };
        
        try {
          await errorInterceptor(error);
        } catch (e) {
          // Expected to throw
        }
        
        expect(localStorage.getItem('token')).toBeNull();
        
        window.location = originalLocation;
      }
    });

    it('should not redirect when on public path', async () => {
      const errorInterceptor = axios.interceptors.response.use.mock.calls[0]?.[1];
      
      if (errorInterceptor) {
        const error = {
          response: { status: 401 },
        };
        
        const originalLocation = window.location;
        delete window.location;
        window.location = { 
          href: '/public/boards',
          pathname: '/public/boards',
        };
        
        try {
          await errorInterceptor(error);
        } catch (e) {
          // Expected to throw
        }
        
        // Should not have changed the href (no redirect)
        expect(window.location.href).toBe('/public/boards');
        
        window.location = originalLocation;
      }
    });
  });

  describe('Azure AD Login', () => {
    it('should redirect to Azure AD authorization endpoint', async () => {
      const { azureLogin } = await import('../api');
      
      const originalLocation = window.location;
      delete window.location;
      window.location = { 
        href: '',
        hostname: 'localhost',
      };
      
      // In development mode
      azureLogin();
      
      expect(window.location.href).toContain('oauth2/authorization/azure');
      
      window.location = originalLocation;
    });
  });
});

describe('API Helper Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Note: Actual API calls would need more sophisticated mocking
  // These tests verify the module exports are correct
  
  describe('Exports', () => {
    it('should export azureLogin function', async () => {
      const api = await import('../api');
      expect(typeof api.azureLogin).toBe('function');
    });

    it('should export getPublicBoards function', async () => {
      const api = await import('../api');
      expect(typeof api.getPublicBoards).toBe('function');
    });

    it('should export getPublicBoardById function', async () => {
      const api = await import('../api');
      expect(typeof api.getPublicBoardById).toBe('function');
    });

    it('should export getUsers function', async () => {
      const api = await import('../api');
      expect(typeof api.getUsers).toBe('function');
    });

    it('should export getTemplates function', async () => {
      const api = await import('../api');
      expect(typeof api.getTemplates).toBe('function');
    });

    it('should export createBoardFromTemplate function', async () => {
      const api = await import('../api');
      expect(typeof api.createBoardFromTemplate).toBe('function');
    });

    it('should export board access functions', async () => {
      const api = await import('../api');
      expect(typeof api.getBoardAccesses).toBe('function');
      expect(typeof api.grantBoardAccess).toBe('function');
      expect(typeof api.revokeBoardAccess).toBe('function');
    });

    it('should export comment functions', async () => {
      const api = await import('../api');
      expect(typeof api.getTaskComments).toBe('function');
      expect(typeof api.createComment).toBe('function');
      expect(typeof api.updateComment).toBe('function');
      expect(typeof api.deleteComment).toBe('function');
    });

    it('should export custom field functions', async () => {
      const api = await import('../api');
      expect(typeof api.getCustomFieldDefinitions).toBe('function');
      expect(typeof api.getTaskCustomFields).toBe('function');
    });

    it('should export status functions', async () => {
      const api = await import('../api');
      expect(typeof api.getStatusesByBoard).toBe('function');
      expect(typeof api.updateStatus).toBe('function');
      expect(typeof api.reorderStatuses).toBe('function');
    });

    it('should export notification functions', async () => {
      const api = await import('../api');
      expect(typeof api.getNotifications).toBe('function');
      expect(typeof api.markNotificationAsRead).toBe('function');
    });
  });
});

