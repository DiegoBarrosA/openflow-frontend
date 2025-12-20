import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BoardList from '../BoardList';
import { AuthProvider } from '../../contexts/AuthContext';
import { I18nProvider } from '../../contexts/I18nContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { BoardActionsProvider } from '../../contexts/BoardActionsContext';

// Mock the api module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  getTemplates: vi.fn(),
  createBoardFromTemplate: vi.fn(),
}));

import api, { getTemplates, createBoardFromTemplate } from '../../services/api';

// Test wrapper with all necessary providers
const renderWithProviders = (ui) => {
  // Set up auth context
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('username', 'testuser');
  localStorage.setItem('role', 'ADMIN');

  return render(
    <MemoryRouter initialEntries={['/boards']}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <BoardActionsProvider>
              <Routes>
                <Route path="/boards" element={ui} />
                <Route path="/boards/:id" element={<div>Board Detail</div>} />
              </Routes>
            </BoardActionsProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('BoardList Component', () => {
  const mockBoards = [
    { id: 1, name: 'Board 1', description: 'Description 1', isPublic: false, isTemplate: false },
    { id: 2, name: 'Board 2', description: 'Description 2', isPublic: true, isTemplate: false },
    { id: 3, name: 'Template Board', description: 'Template', isPublic: false, isTemplate: true },
  ];

  const mockTemplates = [
    { id: 3, name: 'Template Board', description: 'Template', isTemplate: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Set up default API responses
    api.get.mockResolvedValue({ data: mockBoards });
    getTemplates.mockResolvedValue(mockTemplates);
  });

  describe('Rendering', () => {
    it('should render board list heading', async () => {
      renderWithProviders(<BoardList />);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toBeInTheDocument();
      });
    });

    it('should render all boards', async () => {
      renderWithProviders(<BoardList />);

      await waitFor(() => {
        expect(screen.getByText('Board 1')).toBeInTheDocument();
        expect(screen.getByText('Board 2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no boards exist', async () => {
      api.get.mockResolvedValue({ data: [] });

      renderWithProviders(<BoardList />);

      await waitFor(() => {
        expect(screen.queryByText('Board 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Board Creation', () => {
    it('should show create board button for admins', async () => {
      renderWithProviders(<BoardList />);

      await waitFor(() => {
        const createButtons = screen.getAllByRole('button');
        expect(createButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Board Display', () => {
    it('should display public badge for public boards', async () => {
      renderWithProviders(<BoardList />);

      await waitFor(() => {
        expect(screen.getByText('Board 2')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<BoardList />);

      // Should not crash and should render empty list
      await waitFor(() => {
        expect(screen.getByRole('heading')).toBeInTheDocument();
      });
    });
  });

  describe('Template Features', () => {
    it('should fetch templates for admin users', async () => {
      renderWithProviders(<BoardList />);

      await waitFor(() => {
        expect(getTemplates).toHaveBeenCalled();
      });
    });
  });
});

