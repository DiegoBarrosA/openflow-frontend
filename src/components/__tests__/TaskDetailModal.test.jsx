import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskDetailModal from '../TaskDetailModal';
import { I18nProvider } from '../../contexts/I18nContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the api module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
  getTaskComments: vi.fn(),
  createComment: vi.fn(),
  getChangeLog: vi.fn(),
  getTaskAttachments: vi.fn(),
  getTaskCustomFields: vi.fn(),
  getUsers: vi.fn(),
  getStatusesByBoard: vi.fn(),
  updateTask: vi.fn(),
}));

import api, { 
  getTaskComments, 
  getChangeLog, 
  getTaskAttachments, 
  getTaskCustomFields,
  getUsers,
  getStatusesByBoard 
} from '../../services/api';

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

describe('TaskDetailModal Component', () => {
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

  const mockStatuses = [
    { id: 1, name: 'To Do', color: '#0079bf' },
    { id: 2, name: 'In Progress', color: '#61bd4f' },
  ];

  const mockUsers = [
    { id: 1, username: 'user1' },
    { id: 2, username: 'user2' },
  ];

  const defaultProps = {
    task: mockTask,
    boardId: 1,
    onClose: vi.fn(),
    onDelete: vi.fn(),
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Set up default mock responses
    getTaskComments.mockResolvedValue([]);
    getChangeLog.mockResolvedValue([]);
    getTaskAttachments.mockResolvedValue([]);
    getTaskCustomFields.mockResolvedValue([]);
    getUsers.mockResolvedValue(mockUsers);
    getStatusesByBoard.mockResolvedValue(mockStatuses);
  });

  describe('Rendering', () => {
    it('should render modal with task title', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });
    });

    it('should render task description', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Description')).toBeInTheDocument();
      });
    });

    it('should render close button', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        const closeButtons = screen.getAllByRole('button');
        expect(closeButtons.length).toBeGreaterThan(0);
      });
    });

    it('should render delete button', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        // Delete button should be present
        const deleteButton = screen.getByLabelText(/delete/i);
        expect(deleteButton).toBeInTheDocument();
      });
    });
  });

  describe('Modal Interaction', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      renderWithProviders(<TaskDetailModal {...defaultProps} onClose={onClose} />);
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText(/close/i);
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should call onClose when backdrop is clicked', async () => {
      const onClose = vi.fn();
      renderWithProviders(<TaskDetailModal {...defaultProps} onClose={onClose} />);
      
      await waitFor(() => {
        const backdrop = screen.getByRole('dialog').parentElement;
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should show confirmation before deleting', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onDelete = vi.fn();
      
      renderWithProviders(<TaskDetailModal {...defaultProps} onDelete={onDelete} />);
      
      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/delete/i);
        fireEvent.click(deleteButton);
      });

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should call onDelete when confirmed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onDelete = vi.fn();
      
      renderWithProviders(<TaskDetailModal {...defaultProps} onDelete={onDelete} />);
      
      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/delete/i);
        fireEvent.click(deleteButton);
      });

      expect(onDelete).toHaveBeenCalledWith(mockTask.id);
    });

    it('should not call onDelete when cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const onDelete = vi.fn();
      
      renderWithProviders(<TaskDetailModal {...defaultProps} onDelete={onDelete} />);
      
      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/delete/i);
        fireEvent.click(deleteButton);
      });

      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch task comments on mount', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(getTaskComments).toHaveBeenCalledWith(mockTask.id);
      });
    });

    it('should fetch change log on mount', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(getChangeLog).toHaveBeenCalled();
      });
    });

    it('should fetch users for assignment', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(getUsers).toHaveBeenCalled();
      });
    });

    it('should fetch statuses for board', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(getStatusesByBoard).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        const editButton = screen.getByLabelText(/edit/i);
        fireEvent.click(editButton);
      });

      // Edit mode should show save/cancel buttons
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should have aria-modal attribute', async () => {
      renderWithProviders(<TaskDetailModal {...defaultProps} />);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });
  });
});

