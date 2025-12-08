import React, { useState, useEffect } from 'react';
import TaskDetailModal from './TaskDetailModal';
import { getTaskVisibleFieldValues } from '../services/api';
import { useTranslation } from '../contexts/I18nContext';

function Task({ task, boardId, onDelete, onUpdate, onDragStart, onDragEnd }) {
  const t = useTranslation();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [visibleFields, setVisibleFields] = useState([]);

  useEffect(() => {
    if (task.id && boardId) {
      fetchVisibleFields();
    }
  }, [task.id, boardId]);

  const fetchVisibleFields = async () => {
    try {
      const fields = await getTaskVisibleFieldValues(task.id, boardId);
      setVisibleFields(fields);
    } catch (err) {
      console.error('Error fetching visible fields:', err);
    }
  };

  const isDraggable = onDragStart && !showDetailModal;

  const handleDragStart = (e) => {
    if (!onDragStart) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.currentTarget.style.opacity = '0.5';
    onDragStart(task.id);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <>
      <article
        className={`bg-base-07 dark:bg-base-01 rounded-md p-3 sm:p-3 shadow-sm mb-2 relative hover:shadow-md transition-all select-none hover:-translate-y-0.5 group ${
          isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        role="article"
        aria-label={`${t('task.title')}: ${task.title}`}
      >
        <div 
          onClick={() => setShowDetailModal(true)} 
          className="cursor-pointer pr-8"
          role="button"
          tabIndex={0}
          aria-label={`${t('task.viewDetails')}: ${task.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowDetailModal(true);
            }
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm sm:text-base font-medium text-base-05 mb-1 flex-1">{task.title}</h4>
            {task.assignedUsername && (
              <div 
                className="w-6 h-6 rounded-full bg-base-0D flex items-center justify-center text-base-07 font-semibold text-xs flex-shrink-0"
                title={`${t('task.assignee')}: ${task.assignedUsername}`}
              >
                {task.assignedUsername.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {task.description && <p className="text-xs sm:text-sm text-base-04 line-clamp-2">{task.description}</p>}
          
          {/* Visible Custom Fields */}
          {visibleFields.length > 0 && (
            <div className="mt-2 pt-2 border-t border-base-02 dark:border-base-03 flex flex-wrap gap-1.5">
              {visibleFields.map((field) => (
                field.value && (
                  <span
                    key={field.fieldDefinitionId}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-base-0E/20 text-base-05"
                    title={field.fieldName}
                  >
                    <span className="font-medium text-base-04 mr-1">{field.fieldName}:</span>
                    <span className="truncate max-w-[80px]">
                      {field.fieldType === 'CHECKBOX' 
                        ? (field.value === 'true' ? <i className="fas fa-check text-base-0B" aria-hidden="true"></i> : <i className="fas fa-times text-base-08" aria-hidden="true"></i>)
                        : field.value}
                    </span>
                  </span>
                )
              ))}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(t('board.deleteTaskConfirm', { defaultValue: 'Are you sure you want to delete this task?' }))) {
              onDelete(task.id);
            }
          }}
          className="absolute top-2 right-2 text-base-04 hover:text-base-08 text-lg sm:text-xl leading-none w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-base-08/10 rounded transition-all touch-target"
          aria-label={`${t('common.delete')}: ${task.title}`}
          title={t('common.delete')}
        >
          <i className="fas fa-times" aria-hidden="true"></i>
        </button>
      </article>

      {/* Task Detail Modal */}
      {showDetailModal && (
        <TaskDetailModal
          task={task}
          boardId={boardId}
          onClose={() => {
            setShowDetailModal(false);
            fetchVisibleFields(); // Refresh visible fields after closing
          }}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

export default Task;

