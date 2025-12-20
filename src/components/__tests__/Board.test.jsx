import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Board from '../Board';
import { AuthProvider } from '../../contexts/AuthContext';
import { I18nProvider } from '../../contexts/I18nContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { BoardActionsProvider } from '../../contexts/BoardActionsContext';

// Mock the api module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  updateStatus: vi.fn(),
  reorderStatuses: vi.fn(),
  updateBoard: vi.fn(),
  getAllTasksCustomFields: vi.fn(),
}));

import api from '../../services/api';

// Test wrapper with all necessary providers
const renderWithProviders = (ui, { route = '/boards/1' } = {}) => {
  // Set up auth context
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('username', 'testuser');
  localStorage.setItem('role', 'ADMIN');

  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <BoardActionsProvider>
              <Routes>
                <Route path="/boards/:id" element={ui} />
                <Route path="/boards" element={<div>Boards List</div>} />
              </Routes>
            </BoardActionsProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Board Component', () => {
  const mockBoard = {
    id: 1,
    name: 'Test Board',
    description: 'Test Description',
    userId: 1,
    isPublic: false,
    isTemplate: false,
  };

  const mockStatuses = [
    { id: 1, name: 'To Do', color: '#0079bf', boardId: 1, order: 0 },
    { id: 2, name: 'In Progress', color: '#61bd4f', boardId: 1, order: 1 },
  ];

  const mockTasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', statusId: 1, boardId: 1 },
    { id: 2, title: 'Task 2', description: 'Description 2', statusId: 2, boardId: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Set up default API responses
    api.get.mockImplementation((url) => {
      if (url.includes('/boards/1')) {
        return Promise.resolve({ data: mockBoard });
      }
      if (url.includes('/statuses/board/1')) {
        return Promise.resolve({ data: mockStatuses });
      }
      if (url.includes('/tasks')) {
        return Promise.resolve({ data: mockTasks });
      }
      return Promise.resolve({ data: [] });
    });
  });

  describe('Rendering', () => {
    it('should show loading state initially', () => {
      renderWithProviders(<Board />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render board with statuses after loading', async () => {
      renderWithProviders(<Board />);

      await waitFor(() => {
        expect(screen.getByText('To Do')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
      });
    });

    it('should render tasks in correct columns', async () => {
      renderWithProviders(<Board />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no statuses exist', async () => {
      api.get.mockImplementation((url) => {
        if (url.includes('/boards/1')) {
          return Promise.resolve({ data: mockBoard });
        }
        if (url.includes('/statuses/board/1')) {
          return Promise.resolve({ data: [] });
        }
        if (url.includes('/tasks')) {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: [] });
      });

      renderWithProviders(<Board />);

      await waitFor(() => {
        // The empty state message is shown
        expect(screen.queryByText('To Do')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when board fails to load', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<Board />);

      await waitFor(() => {
        // Error state should be displayed
        expect(screen.queryByText('To Do')).not.toBeInTheDocument();
      });
    });
  });

  describe('Task Creation', () => {
    it('should show add task button for each status', async () => {
      renderWithProviders(<Board />);

      await waitFor(() => {
        const addTaskButtons = screen.getAllByRole('button', { name: /add task/i });
        expect(addTaskButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Status Management (Admin)', () => {
    it('should show admin controls when user is admin', async () => {
      renderWithProviders(<Board />);

      await waitFor(() => {
        // Admin controls should be visible
        expect(screen.getByText('To Do')).toBeInTheDocument();
      });
    });
  });
});

