import React, { useState, useEffect } from 'react';
import TaskDetailModal from './TaskDetailModal';
import { getTaskVisibleFieldValues } from '../services/api';

function Task({ task, boardId, onDelete, onUpdate, onDragStart, onDragEnd }) {
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

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.currentTarget.style.opacity = '0.5';
    if (onDragStart) {
      onDragStart(task.id);
    }
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
        className="bg-white rounded-md p-3 sm:p-3 shadow-sm mb-2 relative cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none hover:-translate-y-0.5 group border-l-4 border-[#88D8C0] hover:border-[#82AAFF]"
        draggable={!showDetailModal}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        role="article"
        aria-label={`Task: ${task.title}`}
      >
        <div 
          onClick={() => setShowDetailModal(true)} 
          className="cursor-pointer pr-8"
          role="button"
          tabIndex={0}
          aria-label={`Open task details: ${task.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowDetailModal(true);
            }
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-1 flex-1">{task.title}</h4>
            {task.assignedUsername && (
              <div 
                className="w-6 h-6 rounded-full bg-[#88D8C0] flex items-center justify-center text-gray-800 font-semibold text-xs flex-shrink-0"
                title={`Assigned to ${task.assignedUsername}`}
              >
                {task.assignedUsername.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {task.description && <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{task.description}</p>}
          
          {/* Visible Custom Fields */}
          {visibleFields.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
              {visibleFields.map((field) => (
                field.value && (
                  <span
                    key={field.fieldDefinitionId}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#B19CD9]/20 text-gray-700"
                    title={field.fieldName}
                  >
                    <span className="font-medium text-gray-500 mr-1">{field.fieldName}:</span>
                    <span className="truncate max-w-[80px]">
                      {field.fieldType === 'CHECKBOX' 
                        ? (field.value === 'true' ? '✓' : '✗')
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
            if (window.confirm('Are you sure you want to delete this task?')) {
              onDelete(task.id);
            }
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-lg sm:text-xl leading-none w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all touch-target"
          aria-label={`Delete task: ${task.title}`}
          title="Delete task"
        >
          ×
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

