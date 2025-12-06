import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Task from './Task';
import CustomFieldManager from './CustomFieldManager';
import NotificationBell from './NotificationBell';
import SubscribeButton from './SubscribeButton';
import { useAuth, ROLES } from '../contexts/AuthContext';

function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, getUsername, getRole, logout } = useAuth();
  const [board, setBoard] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#0079bf');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatusId, setDragOverStatusId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCustomFieldManager, setShowCustomFieldManager] = useState(false);
  const menuRef = useRef(null);
  
  const username = getUsername();
  const role = getRole();

  useEffect(() => {
    fetchBoard();
    fetchStatuses();
    fetchTasks();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const fetchBoard = async () => {
    try {
      const response = await api.get(`/boards/${id}`);
      setBoard(response.data);
    } catch (err) {
      console.error('Error fetching board:', err);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await api.get(`/statuses/board/${id}`);
      setStatuses(response.data);
    } catch (err) {
      console.error('Error fetching statuses:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks?boardId=${id}`);
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleCreateStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/statuses', {
        name: newStatusName,
        color: newStatusColor,
        boardId: parseInt(id),
        order: statuses.length,
      });
      setStatuses([...statuses, response.data]);
      setNewStatusName('');
      setNewStatusColor('#0079bf');
      setShowStatusForm(false);
    } catch (err) {
      console.error('Error creating status:', err);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (!window.confirm('Are you sure? This will delete all tasks in this status.')) {
      return;
    }
    try {
      await api.delete(`/statuses/${statusId}`);
      setStatuses(statuses.filter((s) => s.id !== statusId));
      setTasks(tasks.filter((t) => t.statusId !== statusId));
    } catch (err) {
      console.error('Error deleting status:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedStatusId) return;
    try {
      const response = await api.post('/tasks', {
        title: newTaskTitle,
        description: newTaskDescription,
        statusId: selectedStatusId,
        boardId: parseInt(id),
      });
      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowTaskForm(false);
      setSelectedStatusId(null);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updatedTask);
      setTasks(tasks.map((t) => (t.id === taskId ? response.data : t)));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatusId(null);
  };

  const handleDragOver = (e, statusId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatusId(statusId);
  };

  const handleDragLeave = () => {
    setDragOverStatusId(null);
  };

  const handleDrop = async (e, targetStatusId) => {
    e.preventDefault();
    setDragOverStatusId(null);

    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.statusId === targetStatusId) {
      setDraggedTaskId(null);
      return;
    }

    // Optimistically update UI
    const updatedTasks = tasks.map((t) =>
      t.id === draggedTaskId ? { ...t, statusId: targetStatusId } : t
    );
    setTasks(updatedTasks);

    try {
      // Update task status on server
      await handleUpdateTask(draggedTaskId, {
        title: task.title,
        description: task.description,
        statusId: targetStatusId,
        boardId: task.boardId,
      });
    } catch (err) {
      console.error('Error moving task:', err);
      // Revert on error
      setTasks(tasks);
    } finally {
      setDraggedTaskId(null);
    }
  };

  const getTasksByStatus = (statusId) => {
    return tasks.filter((task) => task.statusId === statusId);
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]" role="status" aria-live="polite">
        <div className="text-gray-600 text-base sm:text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-[#F5F5F5] text-gray-700 container-responsive py-4 sm:py-5">
        <div className="max-w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/boards')}
              className="bg-[#88D8C0] hover:bg-[#6FC4A8] px-4 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm text-gray-800 font-medium touch-target text-sm sm:text-base"
              aria-label="Go back to boards list"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate flex-1 text-[#82AAFF]">{board.name}</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Subscribe to board notifications */}
            <SubscribeButton entityType="BOARD" entityId={parseInt(id)} size="sm" />
            
            {/* Only show Add Status and Custom Fields buttons for Admins */}
            {isAdmin() && (
              <>
                <button
                  onClick={() => setShowCustomFieldManager(true)}
                  className="bg-[#B19CD9] hover:bg-[#9B86C9] px-4 sm:px-5 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm text-white font-medium touch-target text-sm sm:text-base"
                  aria-label="Manage custom fields"
                >
                  ⚙ Fields
                </button>
                <button
                  onClick={() => setShowStatusForm(!showStatusForm)}
                  className="bg-[#88D8C0] hover:bg-[#6FC4A8] px-5 sm:px-6 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm text-gray-800 font-medium touch-target w-full sm:w-auto text-sm sm:text-base"
                  aria-label={showStatusForm ? 'Cancel status creation' : 'Add new status'}
                  aria-expanded={showStatusForm}
                >
                  {showStatusForm ? 'Cancel' : 'Add Status'}
                </button>
              </>
            )}
            
            {/* Notifications */}
            <NotificationBell />
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors touch-target"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#88D8C0] flex items-center justify-center text-gray-800 font-semibold text-sm sm:text-base">
                  {username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-gray-700 text-sm sm:text-base font-medium hidden sm:block">
                  {username}
                </span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#88D8C0] flex items-center justify-center text-gray-800 font-semibold">
                        {username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{username}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          role === ROLES.ADMIN 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {role === ROLES.ADMIN ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Logout from application"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Only show status form for Admins */}
      {isAdmin() && showStatusForm && (
        <div className="bg-white p-5 sm:p-6 mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleCreateStatus} className="space-y-4" aria-label="Create status form">
            <div>
              <label htmlFor="status-name" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                Status Name
              </label>
              <input
                id="status-name"
                type="text"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="status-color" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                Color
              </label>
              <input
                id="status-color"
                type="color"
                value={newStatusColor}
                onChange={(e) => setNewStatusColor(e.target.value)}
                className="h-12 sm:h-10 w-24 sm:w-20 rounded border-2 border-[#B19CD9] cursor-pointer touch-target"
                aria-label="Select status color"
              />
            </div>
            <button
              type="submit"
              className="bg-[#82AAFF] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md touch-target text-sm sm:text-base font-medium"
              aria-label="Submit status creation"
            >
              Create Status
            </button>
          </form>
        </div>
      )}

      <main className="container-responsive py-4 sm:py-6 overflow-x-auto">
        {statuses.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-gray-600" role="status" aria-live="polite">
            <p className="text-base sm:text-lg">No statuses yet. Create one to get started!</p>
          </div>
        ) : (
          <div 
            className="flex gap-4 sm:gap-6 items-start overflow-x-auto pb-4"
            role="list"
            aria-label="Status columns"
          >
            {statuses.map((status) => (
              <section
                key={status.id}
                className={`flex-shrink-0 w-full sm:w-[280px] md:w-[300px] bg-white rounded-lg p-3 sm:p-4 transition-colors border-2 ${
                  dragOverStatusId === status.id
                    ? 'bg-[#88D8C0]/30 border-dashed border-[#82AAFF] border-2'
                    : 'border-[#B19CD9]/30'
                }`}
                onDragOver={(e) => handleDragOver(e, status.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status.id)}
                role="listitem"
                aria-label={`Status column: ${status.name}`}
              >
                <div
                  className="flex justify-between items-center p-3 bg-white rounded mb-3 border-t-4 shadow-sm"
                  style={{ borderTopColor: status.color || '#82AAFF' }}
                >
                  <h3 className="font-semibold text-gray-700 text-sm sm:text-base">{status.name}</h3>
                  {/* Only show delete button for Admins */}
                  {isAdmin() && (
                    <button
                      onClick={() => handleDeleteStatus(status.id)}
                      className="text-gray-400 hover:text-red-600 text-xl sm:text-2xl leading-none w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-50 rounded transition-all touch-target"
                      aria-label={`Delete status: ${status.name}`}
                      title="Delete status"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="min-h-[50px] space-y-2" role="list" aria-label={`Tasks in ${status.name}`}>
                  {getTasksByStatus(status.id).map((task) => (
                    <Task
                      key={task.id}
                      task={task}
                      boardId={parseInt(id)}
                      onDelete={handleDeleteTask}
                      onUpdate={handleUpdateTask}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSelectedStatusId(status.id);
                    setShowTaskForm(true);
                  }}
                  className="w-full mt-3 py-2.5 sm:py-2 bg-[#88D8C0] hover:bg-[#6FC4A8] rounded-md text-gray-800 text-sm sm:text-base transition-colors shadow-sm font-medium touch-target"
                  aria-label={`Add task to ${status.name}`}
                >
                  + Add Task
                </button>
              </section>
            ))}
          </div>
        )}
      </main>

      {showTaskForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTaskForm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-form-title"
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-md shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="task-form-title" className="text-xl sm:text-2xl font-bold mb-6 text-gray-700">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4" aria-label="Create task form">
              <div>
                <label htmlFor="task-title" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="task-description" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  id="task-description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent min-h-[80px] resize-y text-base"
                  aria-label="Task description"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="submit"
                  className="bg-[#82AAFF] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md touch-target text-sm sm:text-base font-medium w-full sm:w-auto"
                  aria-label="Submit task creation"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setSelectedStatusId(null);
                  }}
                  className="bg-gray-500 text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-target text-sm sm:text-base font-medium w-full sm:w-auto"
                  aria-label="Cancel task creation"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Field Manager Modal */}
      {showCustomFieldManager && (
        <CustomFieldManager
          boardId={parseInt(id)}
          onClose={() => setShowCustomFieldManager(false)}
        />
      )}
    </div>
  );
}

export default Board;

