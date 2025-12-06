import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { updateStatus, reorderStatuses, updateBoard } from '../services/api';
import Task from './Task';
import CustomFieldManager from './CustomFieldManager';
import CustomFields from './CustomFields';
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
  const [newTaskCustomFields, setNewTaskCustomFields] = useState({});
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatusId, setDragOverStatusId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCustomFieldManager, setShowCustomFieldManager] = useState(false);
  
  // Status editing state
  const [editingStatus, setEditingStatus] = useState(null);
  const [editStatusName, setEditStatusName] = useState('');
  const [editStatusColor, setEditStatusColor] = useState('#0079bf');
  
  // Column drag state
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  
  // Board settings state
  const [showBoardSettings, setShowBoardSettings] = useState(false);
  
  // Edit layout mode - when true, columns are draggable; when false, tasks are draggable
  const [editLayoutMode, setEditLayoutMode] = useState(false);
  
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

  const handleEditStatusClick = (status) => {
    setEditingStatus(status);
    setEditStatusName(status.name);
    setEditStatusColor(status.color || '#0079bf');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingStatus) return;
    
    try {
      const updated = await updateStatus(editingStatus.id, {
        name: editStatusName,
        color: editStatusColor,
        boardId: parseInt(id),
        order: editingStatus.order,
      });
      setStatuses(statuses.map((s) => (s.id === editingStatus.id ? updated : s)));
      setEditingStatus(null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Column drag handlers
  const handleColumnDragStart = (e, statusId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `column:${statusId}`);
    setDraggedColumnId(statusId);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const handleColumnDragOver = (e, statusId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedColumnId && draggedColumnId !== statusId) {
      setDragOverColumnId(statusId);
    }
  };

  const handleColumnDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleColumnDrop = async (e, targetStatusId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    
    if (!draggedColumnId || draggedColumnId === targetStatusId) {
      setDraggedColumnId(null);
      return;
    }
    
    // Calculate new order
    const draggedIndex = statuses.findIndex((s) => s.id === draggedColumnId);
    const targetIndex = statuses.findIndex((s) => s.id === targetStatusId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedColumnId(null);
      return;
    }
    
    // Reorder locally
    const newStatuses = [...statuses];
    const [removed] = newStatuses.splice(draggedIndex, 1);
    newStatuses.splice(targetIndex, 0, removed);
    
    // Update state optimistically
    setStatuses(newStatuses);
    setDraggedColumnId(null);
    
    // Send to server
    try {
      const statusIds = newStatuses.map((s) => s.id);
      await reorderStatuses(parseInt(id), statusIds);
    } catch (err) {
      console.error('Error reordering statuses:', err);
      // Revert on error
      fetchStatuses();
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
        customFieldValues: newTaskCustomFields,
      });
      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskCustomFields({});
      setShowTaskForm(false);
      setSelectedStatusId(null);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleBoardVisibility = async () => {
    if (!board) return;
    try {
      const response = await updateBoard(id, {
        name: board.name,
        description: board.description,
        isPublic: !board.isPublic,
        isTemplate: board.isTemplate,
      });
      setBoard(response.data);
    } catch (err) {
      console.error('Error updating board visibility:', err);
    }
  };

  const handleToggleBoardTemplate = async () => {
    if (!board) return;
    try {
      const response = await updateBoard(id, {
        name: board.name,
        description: board.description,
        isPublic: board.isPublic,
        isTemplate: !board.isTemplate,
      });
      setBoard(response.data);
    } catch (err) {
      console.error('Error updating board template status:', err);
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
            {/* Board badges */}
            {board?.isPublic && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Public
              </span>
            )}
            {board?.isTemplate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Template
              </span>
            )}
            
            {/* Subscribe to board notifications */}
            <SubscribeButton entityType="BOARD" entityId={parseInt(id)} size="sm" />
            
            {/* Only show Add Status and Custom Fields buttons for Admins */}
            {isAdmin() && (
              <>
                <button
                  onClick={() => setEditLayoutMode(!editLayoutMode)}
                  className={`px-4 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm font-medium touch-target text-sm sm:text-base ${
                    editLayoutMode 
                      ? 'bg-[#82AAFF] text-white hover:bg-[#6B8FE8]' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label={editLayoutMode ? 'Exit layout edit mode' : 'Enter layout edit mode'}
                  title={editLayoutMode ? 'Click to exit layout editing' : 'Click to reorder columns'}
                >
                  {editLayoutMode ? '✓ Done' : '↔ Reorder'}
                </button>
                <button
                  onClick={() => setShowBoardSettings(true)}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm text-gray-700 font-medium touch-target text-sm sm:text-base"
                  aria-label="Board settings"
                  title="Board settings"
                >
                  ⚙
                </button>
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
                    : dragOverColumnId === status.id
                    ? 'bg-[#B19CD9]/20 border-dashed border-[#B19CD9] border-2'
                    : editLayoutMode && isAdmin()
                    ? 'border-dashed border-[#82AAFF]/50'
                    : 'border-[#B19CD9]/30'
                } ${draggedColumnId === status.id ? 'opacity-50' : ''}`}
                draggable={isAdmin() && editLayoutMode}
                onDragStart={(e) => isAdmin() && editLayoutMode && handleColumnDragStart(e, status.id)}
                onDragEnd={handleColumnDragEnd}
                onDragOver={(e) => {
                  if (editLayoutMode && draggedColumnId) {
                    handleColumnDragOver(e, status.id);
                  } else if (!editLayoutMode) {
                    handleDragOver(e, status.id);
                  }
                }}
                onDragLeave={() => {
                  if (editLayoutMode && draggedColumnId) {
                    handleColumnDragLeave();
                  } else if (!editLayoutMode) {
                    handleDragLeave();
                  }
                }}
                onDrop={(e) => {
                  if (editLayoutMode && draggedColumnId) {
                    handleColumnDrop(e, status.id);
                  } else if (!editLayoutMode) {
                    handleDrop(e, status.id);
                  }
                }}
                role="listitem"
                aria-label={`Status column: ${status.name}`}
              >
                <div
                  className={`flex justify-between items-center p-3 bg-white rounded mb-3 border-t-4 shadow-sm ${isAdmin() && editLayoutMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  style={{ borderTopColor: status.color || '#82AAFF' }}
                >
                  <h3 className="font-semibold text-gray-700 text-sm sm:text-base flex-1">{status.name}</h3>
                  {/* Only show edit/delete buttons for Admins */}
                  {isAdmin() && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditStatusClick(status)}
                        className="text-gray-400 hover:text-[#82AAFF] text-sm leading-none w-7 h-7 flex items-center justify-center hover:bg-blue-50 rounded transition-all"
                        aria-label={`Edit status: ${status.name}`}
                        title="Edit status"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteStatus(status.id)}
                        className="text-gray-400 hover:text-red-600 text-xl sm:text-2xl leading-none w-7 h-7 flex items-center justify-center hover:bg-red-50 rounded transition-all"
                        aria-label={`Delete status: ${status.name}`}
                        title="Delete status"
                      >
                        ×
                      </button>
                    </div>
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
                      onDragStart={editLayoutMode ? null : handleDragStart}
                      onDragEnd={editLayoutMode ? null : handleDragEnd}
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
              
              {/* Custom Fields for creation */}
              <CustomFields
                taskId={null}
                boardId={parseInt(id)}
                mode="create"
                initialValues={newTaskCustomFields}
                onChange={(values) => setNewTaskCustomFields(values)}
              />
              
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
                    setNewTaskCustomFields({});
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

      {/* Board Settings Modal */}
      {showBoardSettings && board && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBoardSettings(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="board-settings-title"
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-md shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="board-settings-title" className="text-xl sm:text-2xl font-bold mb-6 text-gray-700">Board Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-700">Public Board</h3>
                  <p className="text-sm text-gray-500">
                    {board.isPublic 
                      ? 'This board is visible to everyone' 
                      : 'Only you can see this board'}
                  </p>
                </div>
                <button
                  onClick={handleToggleBoardVisibility}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    board.isPublic ? 'bg-[#82AAFF]' : 'bg-gray-300'
                  }`}
                  aria-label={board.isPublic ? 'Make board private' : 'Make board public'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      board.isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-700">Template</h3>
                  <p className="text-sm text-gray-500">
                    {board.isTemplate 
                      ? 'This board can be used as a template' 
                      : 'Mark as template to reuse structure'}
                  </p>
                </div>
                <button
                  onClick={handleToggleBoardTemplate}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    board.isTemplate ? 'bg-[#B19CD9]' : 'bg-gray-300'
                  }`}
                  aria-label={board.isTemplate ? 'Unmark as template' : 'Mark as template'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      board.isTemplate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowBoardSettings(false)}
                  className="bg-gray-500 text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingStatus && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingStatus(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-status-title"
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-md shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-status-title" className="text-xl sm:text-2xl font-bold mb-6 text-gray-700">Edit Status</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4" aria-label="Edit status form">
              <div>
                <label htmlFor="edit-status-name" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                  Status Name
                </label>
                <input
                  id="edit-status-name"
                  type="text"
                  value={editStatusName}
                  onChange={(e) => setEditStatusName(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-status-color" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="edit-status-color"
                    type="color"
                    value={editStatusColor}
                    onChange={(e) => setEditStatusColor(e.target.value)}
                    className="h-12 sm:h-10 w-24 sm:w-20 rounded border-2 border-[#B19CD9] cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">{editStatusColor}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#82AAFF] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md text-sm sm:text-base font-medium w-full sm:w-auto"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStatus(null)}
                  className="bg-gray-500 text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base font-medium w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;

