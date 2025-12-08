import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { updateStatus, reorderStatuses, updateBoard } from '../services/api';
import Task from './Task';
import CustomFieldManager from './CustomFieldManager';
import CustomFields from './CustomFields';
import BoardAccessManager from './BoardAccessManager';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { useBoardActions } from '../contexts/BoardActionsContext';

function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const t = useTranslation();
  const { setBoardActions } = useBoardActions();
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
  const [showBoardAccessManager, setShowBoardAccessManager] = useState(false);
  
  // Edit layout mode - when true, columns are draggable; when false, tasks are draggable
  const [editLayoutMode, setEditLayoutMode] = useState(false);

  useEffect(() => {
    fetchBoard();
    fetchStatuses();
    fetchTasks();
  }, [id]);

  // Set board data for NavigationBar
  useEffect(() => {
    if (board) {
      setBoardActions({
        boardId: parseInt(id),
        boardName: board.name,
        boardBadges: [
          ...(board.isPublic ? [{ type: 'public', label: t('board.public'), icon: 'fa-globe' }] : []),
          ...(board.isTemplate ? [{ type: 'template', label: t('board.template'), icon: 'fa-copy' }] : []),
        ],
        showBackButton: true,
        backTo: '/boards',
        adminActions: isAdmin() ? (
          <>
            <button
              onClick={() => setEditLayoutMode(!editLayoutMode)}
              className={`px-4 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm font-medium touch-target text-sm sm:text-base ${
                editLayoutMode 
                  ? 'bg-base-0D text-base-07 hover:bg-base-0D/90' 
                  : 'bg-base-01 dark:bg-base-02 text-base-05 hover:bg-base-02 dark:hover:bg-base-03'
              }`}
              aria-label={editLayoutMode ? t('board.exitLayoutEditMode') : t('board.enterLayoutEditMode')}
              title={editLayoutMode ? t('board.clickToExitLayoutEditing') : t('board.clickToReorderColumns')}
            >
              <i className={`fas fa-${editLayoutMode ? 'check' : 'arrows-alt'} mr-2`} aria-hidden="true"></i>
              {editLayoutMode ? t('board.done') : t('board.reorder')}
            </button>
            <button
              onClick={() => setShowBoardSettings(true)}
              className="bg-base-01 dark:bg-base-02 hover:bg-base-02 dark:hover:bg-base-03 px-3 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm text-base-05 font-medium touch-target text-sm sm:text-base"
              aria-label={t('board.boardSettings')}
              title={t('board.boardSettings')}
            >
              <i className="fas fa-cog" aria-hidden="true"></i>
            </button>
            <button
              onClick={() => setShowCustomFieldManager(true)}
              className="bg-base-0E hover:bg-base-0E/90 px-4 sm:px-5 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm text-base-07 font-medium touch-target text-sm sm:text-base"
              aria-label={t('board.manageCustomFields')}
            >
              <i className="fas fa-tags mr-2" aria-hidden="true"></i>
              {t('board.customFields')}
            </button>
            <button
              onClick={() => setShowStatusForm(!showStatusForm)}
              className="bg-base-0D hover:bg-base-0D/90 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md transition-colors shadow-sm text-base-07 font-medium touch-target w-full sm:w-auto text-sm sm:text-base"
              aria-label={showStatusForm ? t('common.cancel') : t('board.addStatus')}
              aria-expanded={showStatusForm}
            >
              <i className={`fas fa-${showStatusForm ? 'times' : 'plus'} mr-2`} aria-hidden="true"></i>
              {showStatusForm ? t('common.cancel') : t('board.addStatus')}
            </button>
          </>
        ) : null,
      });
    } else {
      setBoardActions(null);
    }

    return () => {
      setBoardActions(null);
    };
  }, [board, editLayoutMode, showStatusForm, setBoardActions, t, isAdmin, id]);

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
    if (!window.confirm(t('board.deleteStatusConfirm'))) {
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
      <div className="min-h-screen flex items-center justify-center bg-base-00" role="status" aria-live="polite">
        <div className="text-base-05 text-base sm:text-lg">
          <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-00">
      {/* Only show status form for Admins */}
      {isAdmin() && showStatusForm && (
        <div className="bg-base-07 dark:bg-base-01 p-5 sm:p-6 mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-lg shadow-sm border border-base-02 dark:border-base-03">
          <form onSubmit={handleCreateStatus} className="space-y-4" aria-label={t('board.createStatus')}>
            <div>
              <label htmlFor="status-name" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                <i className="fas fa-tag mr-2" aria-hidden="true"></i>
                {t('board.statusName')}
              </label>
              <input
                id="status-name"
                type="text"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="status-color" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                <i className="fas fa-palette mr-2" aria-hidden="true"></i>
                {t('board.statusColor')}
              </label>
              <input
                id="status-color"
                type="color"
                value={newStatusColor}
                onChange={(e) => setNewStatusColor(e.target.value)}
                className="h-12 sm:h-10 w-24 sm:w-20 rounded border-2 border-base-0E cursor-pointer touch-target"
                aria-label={t('board.statusColor')}
              />
            </div>
            <button
              type="submit"
              className="bg-base-0D text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md touch-target text-sm sm:text-base font-medium"
              aria-label={t('board.createStatus')}
            >
              <i className="fas fa-check mr-2" aria-hidden="true"></i>
              {t('board.createStatus')}
            </button>
          </form>
        </div>
      )}

      <main className="container-responsive py-4 sm:py-6 overflow-x-auto">
        {statuses.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-base-04" role="status" aria-live="polite">
            <i className="fas fa-columns text-4xl mb-4" aria-hidden="true"></i>
            <p className="text-base sm:text-lg">{t('board.noStatusesYet')}</p>
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
                className={`flex-shrink-0 w-full sm:w-[280px] md:w-[300px] bg-base-07 dark:bg-base-01 rounded-lg p-3 sm:p-4 transition-colors border ${
                  dragOverStatusId === status.id
                    ? 'bg-base-0D/30 border-dashed border-base-0D'
                    : dragOverColumnId === status.id
                    ? 'bg-base-0E/20 border-dashed border-base-0E'
                    : editLayoutMode && isAdmin()
                    ? 'border-dashed border-base-0D/50'
                    : 'border-base-02 dark:border-base-03'
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
                aria-label={`${t('board.statusColumn')}: ${status.name}`}
              >
                <div
                  className={`flex justify-between items-center p-3 bg-base-07 dark:bg-base-01 rounded mb-3 border-t-4 shadow-sm ${isAdmin() && editLayoutMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  style={{ borderTopColor: status.color || '#82AAFF' }}
                >
                  <h3 className="font-semibold text-base-05 text-sm sm:text-base flex-1">{status.name}</h3>
                  {/* Only show edit/delete buttons for Admins */}
                  {isAdmin() && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditStatusClick(status)}
                        className="text-base-04 hover:text-base-0D text-sm leading-none w-7 h-7 flex items-center justify-center hover:bg-base-0D/10 rounded transition-all"
                        aria-label={`${t('board.editStatus')}: ${status.name}`}
                        title={t('board.editStatus')}
                      >
                        <i className="fas fa-edit" aria-hidden="true"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteStatus(status.id)}
                        className="text-base-04 hover:text-base-08 text-xl sm:text-2xl leading-none w-7 h-7 flex items-center justify-center hover:bg-base-08/10 rounded transition-all"
                        aria-label={`${t('board.deleteStatus')}: ${status.name}`}
                        title={t('board.deleteStatus')}
                      >
                        <i className="fas fa-times" aria-hidden="true"></i>
                      </button>
                    </div>
                  )}
                </div>
                <div className="min-h-[50px] space-y-2" role="list" aria-label={`${t('board.tasksIn')} ${status.name}`}>
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
                  className="w-full mt-3 py-2.5 sm:py-2 bg-base-0D hover:bg-base-0D/90 rounded-md text-base-07 text-sm sm:text-base transition-colors shadow-sm font-medium touch-target"
                  aria-label={`${t('board.addTaskTo')} ${status.name}`}
                >
                  <i className="fas fa-plus mr-2" aria-hidden="true"></i>
                  {t('board.addTask')}
                </button>
              </section>
            ))}
          </div>
        )}
      </main>

      {showTaskForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTaskForm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-form-title"
        >
          <div
            className="bg-base-07 dark:bg-base-01 p-6 sm:p-8 rounded-lg w-full max-w-md shadow-lg border border-base-02 dark:border-base-03 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="task-form-title" className="text-xl sm:text-2xl font-bold mb-6 text-base-05">
              <i className="fas fa-plus-circle mr-2" aria-hidden="true"></i>
              {t('board.createTask')}
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4" aria-label={t('board.createTask')}>
              <div>
                <label htmlFor="task-title" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                  <i className="fas fa-heading mr-2" aria-hidden="true"></i>
                  {t('task.title')}
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="task-description" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                  <i className="fas fa-align-left mr-2" aria-hidden="true"></i>
                  {t('task.description')}
                </label>
                <textarea
                  id="task-description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent min-h-[80px] resize-y text-base bg-base-07 dark:bg-base-00 text-base-05"
                  aria-label={t('task.description')}
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
                  className="bg-base-0D text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md touch-target text-sm sm:text-base font-medium w-full sm:w-auto"
                  aria-label={t('board.createTask')}
                >
                  <i className="fas fa-check mr-2" aria-hidden="true"></i>
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setSelectedStatusId(null);
                    setNewTaskCustomFields({});
                  }}
                  className="bg-base-08 hover:bg-base-08/90 text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-base-08 focus:ring-offset-2 transition-colors touch-target text-sm sm:text-base font-medium w-full sm:w-auto"
                  aria-label={t('common.cancel')}
                >
                  <i className="fas fa-times mr-2" aria-hidden="true"></i>
                  {t('common.cancel')}
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

      {/* Board Access Manager Modal */}
      {showBoardAccessManager && board && (
        <BoardAccessManager
          boardId={parseInt(id)}
          boardOwnerId={board.userId}
          onClose={() => setShowBoardAccessManager(false)}
        />
      )}

      {/* Board Settings Modal */}
      {showBoardSettings && board && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBoardSettings(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="board-settings-title"
        >
          <div
            className="bg-base-07 dark:bg-base-01 p-6 sm:p-8 rounded-lg w-full max-w-md shadow-lg border border-base-02 dark:border-base-03"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="board-settings-title" className="text-xl sm:text-2xl font-bold mb-6 text-base-05">
              <i className="fas fa-cog mr-2" aria-hidden="true"></i>
              {t('board.boardSettings')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-01 dark:bg-base-02 rounded-lg">
                <div>
                  <h3 className="font-medium text-base-05">
                    <i className="fas fa-globe mr-2" aria-hidden="true"></i>
                    {t('board.publicBoard')}
                  </h3>
                  <p className="text-sm text-base-04">
                    {board.isPublic 
                      ? t('board.thisBoardIsVisibleToEveryone')
                      : t('board.onlyYouCanSeeThisBoard')}
                  </p>
                </div>
                <button
                  onClick={handleToggleBoardVisibility}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    board.isPublic ? 'bg-base-0D' : 'bg-base-03'
                  }`}
                  aria-label={board.isPublic ? t('board.makeBoardPrivate') : t('board.makeBoardPublic')}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-base-07 transition-transform ${
                      board.isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-base-01 dark:bg-base-02 rounded-lg">
                <div>
                  <h3 className="font-medium text-base-05">
                    <i className="fas fa-copy mr-2" aria-hidden="true"></i>
                    {t('board.template')}
                  </h3>
                  <p className="text-sm text-base-04">
                    {board.isTemplate 
                      ? t('board.thisBoardCanBeUsedAsTemplate')
                      : t('board.markAsTemplateToReuseStructure')}
                  </p>
                </div>
                <button
                  onClick={handleToggleBoardTemplate}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    board.isTemplate ? 'bg-base-0E' : 'bg-base-03'
                  }`}
                  aria-label={board.isTemplate ? t('board.unmarkAsTemplate') : t('board.markAsTemplate')}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-base-07 transition-transform ${
                      board.isTemplate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowBoardSettings(false)}
                  className="bg-base-08 hover:bg-base-08/90 text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-base-08 focus:ring-offset-2 transition-colors text-sm sm:text-base font-medium"
                >
                  <i className="fas fa-times mr-2" aria-hidden="true"></i>
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingStatus && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingStatus(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-status-title"
        >
          <div
            className="bg-base-07 dark:bg-base-01 p-6 sm:p-8 rounded-lg w-full max-w-md shadow-lg border border-base-02 dark:border-base-03"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-status-title" className="text-xl sm:text-2xl font-bold mb-6 text-base-05">
              <i className="fas fa-edit mr-2" aria-hidden="true"></i>
              {t('board.editStatus')}
            </h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4" aria-label={t('board.editStatus')}>
              <div>
                <label htmlFor="edit-status-name" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                  <i className="fas fa-tag mr-2" aria-hidden="true"></i>
                  {t('board.statusName')}
                </label>
                <input
                  id="edit-status-name"
                  type="text"
                  value={editStatusName}
                  onChange={(e) => setEditStatusName(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base bg-base-07 dark:bg-base-00 text-base-05"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-status-color" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                  <i className="fas fa-palette mr-2" aria-hidden="true"></i>
                  {t('board.statusColor')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="edit-status-color"
                    type="color"
                    value={editStatusColor}
                    onChange={(e) => setEditStatusColor(e.target.value)}
                    className="h-12 sm:h-10 w-24 sm:w-20 rounded border-2 border-base-0E cursor-pointer"
                  />
                  <span className="text-sm text-base-04">{editStatusColor}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <button
                  type="submit"
                  className="bg-base-0D text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md text-sm sm:text-base font-medium w-full sm:w-auto"
                >
                  <i className="fas fa-save mr-2" aria-hidden="true"></i>
                  {t('board.saveChanges')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStatus(null)}
                  className="bg-base-08 hover:bg-base-08/90 text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-base-08 focus:ring-offset-2 transition-colors text-sm sm:text-base font-medium w-full sm:w-auto"
                >
                  <i className="fas fa-times mr-2" aria-hidden="true"></i>
                  {t('common.cancel')}
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

