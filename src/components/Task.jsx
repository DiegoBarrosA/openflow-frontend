import React, { useState } from 'react';

function Task({ task, onDelete, onUpdate, onDragStart, onDragEnd }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = () => {
    onUpdate(task.id, {
      title,
      description,
      statusId: task.statusId,
      boardId: task.boardId,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
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

  if (isEditing) {
    return (
      <article className="bg-white rounded-md p-3 sm:p-3 shadow-sm mb-2 border-l-4 border-[#82AAFF]" role="article" aria-label={`Editing task: ${task.title}`}>
        <div className="mb-2">
          <label htmlFor={`task-title-edit-${task.id}`} className="sr-only">Task title</label>
          <input
            id={`task-title-edit-${task.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2 py-2 sm:py-1.5 border border-gray-300 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#82AAFF] touch-target"
            aria-label="Task title"
          />
        </div>
        <div className="mb-2">
          <label htmlFor={`task-desc-edit-${task.id}`} className="sr-only">Task description</label>
          <textarea
            id={`task-desc-edit-${task.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-2 py-2 sm:py-1.5 border border-gray-300 rounded text-xs sm:text-sm min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-[#82AAFF]"
            placeholder="Add description..."
            aria-label="Task description"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleSave}
            className="bg-[#82AAFF] text-white px-3 py-2 sm:py-1.5 rounded text-xs sm:text-sm hover:bg-[#6B8FE8] transition-colors shadow-sm touch-target font-medium"
            aria-label="Save task changes"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-3 py-2 sm:py-1.5 rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors touch-target font-medium"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className="bg-white rounded-md p-3 sm:p-3 shadow-sm mb-2 relative cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none hover:-translate-y-0.5 group border-l-4 border-[#88D8C0] hover:border-[#82AAFF]"
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <div 
        onClick={() => setIsEditing(true)} 
        className="cursor-pointer pr-8"
        role="button"
        tabIndex={0}
        aria-label={`Edit task: ${task.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
      >
        <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-1">{task.title}</h4>
        {task.description && <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{task.description}</p>}
      </div>
      <button
        onClick={() => {
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
  );
}

export default Task;

