import React, { useState, useEffect } from 'react';
import CustomFields from './CustomFields';
import ChangeHistory from './ChangeHistory';
import SubscribeButton from './SubscribeButton';
import { getAllUsers } from '../services/api';

/**
 * TaskDetailModal - A larger modal for viewing and editing task details.
 */
function TaskDetailModal({ task, boardId, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignedUserId, setAssignedUserId] = useState(task.assignedUserId || null);
  const [users, setUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Update local state when task changes
    setTitle(task.title);
    setDescription(task.description || '');
    setAssignedUserId(task.assignedUserId || null);
    fetchUsers();
  }, [task]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(task.id, {
        title,
        description,
        statusId: task.statusId,
        boardId: task.boardId,
        assignedUserId: assignedUserId,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      // Auto-close after brief success feedback
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setAssignedUserId(task.assignedUserId || null);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 transition-all duration-300 ${
          saveSuccess 
            ? 'bg-gradient-to-r from-[#88D8C0]/30 to-[#88D8C0]/10' 
            : 'bg-gradient-to-r from-[#82AAFF]/10 to-[#B19CD9]/10'
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {saveSuccess ? (
              <div className="flex items-center gap-2 text-[#2E8B57]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg font-semibold">Saved successfully!</span>
              </div>
            ) : isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-lg sm:text-xl font-bold text-gray-800 bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent"
                placeholder="Task title"
                autoFocus
              />
            ) : (
              <h2 id="task-detail-title" className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {task.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <SubscribeButton entityType="TASK" entityId={task.id} size="sm" />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Assigned User */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Assigned To
              </label>
              {isEditing ? (
                <select
                  value={assignedUserId || ''}
                  onChange={(e) => setAssignedUserId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base"
                >
                  <option value="">-- Unassigned --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              ) : (
                <div 
                  className="w-full px-4 py-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  {task.assignedUsername ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-[#88D8C0] flex items-center justify-center text-gray-800 font-semibold text-sm">
                        {task.assignedUsername.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700">{task.assignedUsername}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Unassigned. Click to assign...</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent min-h-[120px] resize-y text-base"
                  placeholder="Add a description..."
                />
              ) : (
                <div 
                  className="w-full px-4 py-3 bg-gray-50 rounded-md text-gray-700 min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {description || <span className="text-gray-400 italic">No description. Click to add...</span>}
                </div>
              )}
            </div>

            {/* Custom Fields */}
            <div>
              <CustomFields 
                taskId={task.id} 
                boardId={boardId} 
                readOnly={false}
              />
            </div>

            {/* Change History */}
            <div className="border-t border-gray-200 pt-4">
              <ChangeHistory entityType="task" entityId={task.id} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-md transition-colors text-sm font-medium"
            aria-label="Delete task"
          >
            Delete Task
          </button>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#82AAFF] text-white px-5 py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#82AAFF] text-white px-5 py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-sm text-sm font-medium"
                >
                  Edit Task
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;

