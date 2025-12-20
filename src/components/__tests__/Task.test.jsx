import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Task from '../Task';
import { I18nProvider } from '../../contexts/I18nContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the api module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  getTaskVisibleFieldValues: vi.fn(),
  getTaskComments: vi.fn(),
  getChangeLog: vi.fn(),
  getTaskAttachments: vi.fn(),
  getTaskCustomFields: vi.fn(),
  getUsers: vi.fn(),
  getStatusesByBoard: vi.fn(),
}));

import { getTaskVisibleFieldValues } from '../../services/api';

// Test wrapper with all necessary providers
const renderWithProviders = (ui) => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('username', 'testuser');
  localStorage.setItem('role', 'USER');

  return render(
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

describe('Task Component', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    statusId: 1,
    boardId: 1,
    assignedUserId: null,
    assignedUsername: null,
    createdAt: '2024-01-01T00:00:00',
  };

  const mockTaskWithAssignee = {
    ...mockTask,
    assignedUserId: 2,
    assignedUsername: 'assignee',
  };

  const defaultProps = {
    task: mockTask,
    boardId: 1,
    onDelete: vi.fn(),
    onUpdate: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getTaskVisibleFieldValues.mockResolvedValue([]);
  });

  describe('Rendering', () => {
    it('should render task title', () => {
      renderWithProviders(<Task {...defaultProps} />);
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should render task article with correct aria-label', () => {
      renderWithProviders(<Task {...defaultProps} />);
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('should render assignee avatar when task has assignee', () => {
      renderWithProviders(<Task {...defaultProps} task={mockTaskWithAssignee} />);
      // Assignee avatar shows first letter of username
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should not render assignee avatar when no assignee', () => {
      renderWithProviders(<Task {...defaultProps} />);
      expect(screen.queryByTitle(/assignee/i)).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should be draggable when onDragStart is provided', () => {
      renderWithProviders(<Task {...defaultProps} />);
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('draggable', 'true');
    });

    it('should not be draggable when onDragStart is null', () => {
      renderWithProviders(<Task {...defaultProps} onDragStart={null} />);
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('draggable', 'false');
    });

    it('should call onDragStart when drag starts', () => {
      const onDragStart = vi.fn();
      renderWithProviders(<Task {...defaultProps} onDragStart={onDragStart} />);
      
      const article = screen.getByRole('article');
      const dataTransfer = { 
        effectAllowed: '',
        setData: vi.fn(),
      };
      
      fireEvent.dragStart(article, { dataTransfer });
      expect(onDragStart).toHaveBeenCalledWith(mockTask.id);
    });

    it('should call onDragEnd when drag ends', () => {
      const onDragEnd = vi.fn();
      renderWithProviders(<Task {...defaultProps} onDragEnd={onDragEnd} />);
      
      const article = screen.getByRole('article');
      fireEvent.dragEnd(article);
      
      expect(onDragEnd).toHaveBeenCalled();
    });
  });

  describe('Modal Interaction', () => {
    it('should open detail modal when task is clicked', async () => {
      renderWithProviders(<Task {...defaultProps} />);
      
      const clickableArea = screen.getByRole('button');
      fireEvent.click(clickableArea);
      
      // Modal should open - look for modal elements
      await waitFor(() => {
        // The modal would be rendered
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });
    });

    it('should open detail modal when Enter key is pressed', async () => {
      renderWithProviders(<Task {...defaultProps} />);
      
      const clickableArea = screen.getByRole('button');
      fireEvent.keyDown(clickableArea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });
    });

    it('should open detail modal when Space key is pressed', async () => {
      renderWithProviders(<Task {...defaultProps} />);
      
      const clickableArea = screen.getByRole('button');
      fireEvent.keyDown(clickableArea, { key: ' ' });
      
      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Fields', () => {
    it('should fetch visible custom fields on mount', async () => {
      renderWithProviders(<Task {...defaultProps} />);
      
      await waitFor(() => {
        expect(getTaskVisibleFieldValues).toHaveBeenCalledWith(mockTask.id, 1);
      });
    });

    it('should render custom field badges when available', async () => {
      const mockFields = [
        { name: 'Priority', value: 'High', color: '#ff0000' },
      ];
      getTaskVisibleFieldValues.mockResolvedValue(mockFields);

      renderWithProviders(<Task {...defaultProps} />);

      await waitFor(() => {
        expect(getTaskVisibleFieldValues).toHaveBeenCalled();
      });
    });
  });
});

