import React, { useState, useEffect } from 'react';
import CustomFields from './CustomFields';
import ChangeHistory from './ChangeHistory';
import SubscribeButton from './SubscribeButton';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';
import { getAllUsers } from '../services/api';
import { useTranslation } from '../contexts/I18nContext';

/**
 * TaskDetailModal - A larger modal for viewing and editing task details.
 */
function TaskDetailModal({ task, boardId, onClose, onUpdate, onDelete }) {
  const t = useTranslation();
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
    if (window.confirm(t('board.deleteTaskConfirm'))) {
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div
        className="bg-base-07 dark:bg-base-01 rounded-xl w-full max-w-2xl shadow-2xl border border-base-02 dark:border-base-03 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b border-base-02 dark:border-base-03 transition-all duration-300 ${
          saveSuccess 
            ? 'bg-gradient-to-r from-base-0B/30 to-base-0B/10' 
            : 'bg-gradient-to-r from-base-0D/10 to-base-0E/10'
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {saveSuccess ? (
              <div className="flex items-center gap-2 text-base-0B">
                <i className="fas fa-check-circle text-xl" aria-hidden="true"></i>
                <span className="text-lg font-semibold">{t('task.savedSuccessfully')}</span>
              </div>
            ) : isEditing ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                  maxLength={200}
                  className="w-full text-lg sm:text-xl font-bold text-base-05 bg-base-07 dark:bg-base-00 px-3 py-2 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent"
                  placeholder={t('task.taskTitle')}
                  autoFocus
                />
                <div className="text-xs text-base-04 text-right mt-1">{title.length}/200</div>
              </div>
            ) : (
              <h2 id="task-detail-title" className="text-lg sm:text-xl font-bold text-base-05 truncate">
                {task.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <SubscribeButton entityType="TASK" entityId={task.id} size="sm" />
            <button
              onClick={handleDelete}
              className="text-base-04 hover:text-base-08 text-lg w-8 h-8 flex items-center justify-center hover:bg-base-08/10 rounded-full transition-all"
              aria-label={t('board.deleteTask')}
              title={t('board.deleteTask')}
            >
              <i className="fas fa-trash" aria-hidden="true"></i>
            </button>
            <button
              onClick={onClose}
              className="text-base-04 hover:text-base-05 text-2xl leading-none w-8 h-8 flex items-center justify-center hover:bg-base-01 dark:hover:bg-base-02 rounded-full transition-all"
              aria-label={t('common.close')}
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Assigned User */}
            <div>
              <label className="block text-sm font-medium text-base-05 mb-2">
                <i className="fas fa-user mr-2" aria-hidden="true"></i>
                {t('task.assignedTo')}
              </label>
              {isEditing ? (
                <select
                  value={assignedUserId || ''}
                  onChange={(e) => setAssignedUserId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base bg-base-07 dark:bg-base-00 text-base-05"
                >
                  <option value="">-- {t('task.unassigned')} --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              ) : (
                <div 
                  className="w-full px-4 py-3 bg-base-01 dark:bg-base-02 rounded-md cursor-pointer hover:bg-base-02 dark:hover:bg-base-03 transition-colors flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  {task.assignedUsername ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-base-0D flex items-center justify-center text-base-07 font-semibold text-sm">
                        {task.assignedUsername.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-base-05">{task.assignedUsername}</span>
                    </>
                  ) : (
                    <span className="text-base-04 italic">{t('task.unassignedClickToAssign')}</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-base-05 mb-2">
                <i className="fas fa-align-left mr-2" aria-hidden="true"></i>
                {t('task.description')}
              </label>
              {isEditing ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent min-h-[120px] resize-y text-base bg-base-07 dark:bg-base-00 text-base-05"
                    placeholder={t('task.addDescription')}
                  />
                  <div className="text-xs text-base-04 text-right mt-1">{description.length}/1000</div>
                </div>
              ) : (
                <div 
                  className="w-full px-4 py-3 bg-base-01 dark:bg-base-02 rounded-md text-base-05 min-h-[60px] cursor-pointer hover:bg-base-02 dark:hover:bg-base-03 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {description || <span className="text-base-04 italic">{t('task.noDescriptionClickToAdd')}</span>}
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

            {/* Attachments */}
            <div className="border-t border-base-02 dark:border-base-03 pt-4">
              <TaskAttachments taskId={task.id} />
            </div>

            {/* Comments */}
            <div className="border-t border-base-02 dark:border-base-03 pt-4">
              <TaskComments taskId={task.id} />
            </div>

            {/* Change History */}
            <div className="border-t border-base-02 dark:border-base-03 pt-4">
              <ChangeHistory entityType="task" entityId={task.id} />
            </div>
          </div>
        </div>

        {/* Footer - Only show when editing */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-base-02 dark:border-base-03 bg-base-01 dark:bg-base-02">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-base-05 hover:bg-base-02 dark:hover:bg-base-03 rounded-md transition-colors text-sm font-medium"
              disabled={isSaving}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-base-0D text-base-07 px-5 py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                  {t('task.saving')}
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2" aria-hidden="true"></i>
                  {t('board.saveChanges')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetailModal;

