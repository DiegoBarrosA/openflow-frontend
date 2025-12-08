import React, { useState, useEffect } from 'react';
import { getTaskComments, createComment, updateComment, deleteComment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';

/**
 * TaskComments - Component for displaying and managing task comments.
 */
function TaskComments({ taskId }) {
  const t = useTranslation();
  const { getUsername, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUsername = getUsername();

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const data = await getTaskComments(taskId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createComment(taskId, newComment.trim());
      setComments([...comments, created]);
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingContent.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await updateComment(commentId, editingContent.trim());
      setComments(comments.map(c => c.id === commentId ? updated : c));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm(t('comment.deleteConfirm'))) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const canEditOrDelete = (comment) => {
    return comment.username === currentUsername || isAdmin();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('comment.justNow');
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? t('comment.minuteAgo') : t('comment.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? t('comment.hourAgo') : t('comment.hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? t('comment.dayAgo') : t('comment.daysAgo')}`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-base-05 flex items-center gap-2">
        <i className="fas fa-comments" aria-hidden="true"></i>
        {t('comment.comments')} ({comments.length})
      </h3>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-4 text-base-04">
          <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
          {t('common.loading')}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-base-04 text-sm text-center py-4">{t('comment.noComments')}</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-base-01 dark:bg-base-02 rounded-lg p-4 border border-base-02 dark:border-base-03"
            >
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full px-3 py-2 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-sm bg-base-07 dark:bg-base-00 text-base-05 min-h-[80px] resize-y"
                    placeholder={t('comment.placeholder')}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={isSubmitting || !editingContent.trim()}
                      className="bg-base-0D text-base-07 px-3 py-1.5 rounded-md hover:bg-base-0D/90 text-sm font-medium disabled:opacity-50"
                    >
                      <i className="fas fa-save mr-1" aria-hidden="true"></i>
                      {t('common.save')}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      className="bg-base-04 text-base-07 px-3 py-1.5 rounded-md hover:bg-base-04/90 text-sm font-medium disabled:opacity-50"
                    >
                      <i className="fas fa-times mr-1" aria-hidden="true"></i>
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-base-0D flex items-center justify-center text-base-07 font-semibold text-sm">
                        {comment.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-base-05">{comment.username}</p>
                        <p className="text-xs text-base-04">
                          {formatDate(comment.createdAt)}
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <span className="ml-1">({t('comment.edited')})</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {canEditOrDelete(comment) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="text-base-04 hover:text-base-0D text-sm px-2 py-1 rounded hover:bg-base-0D/10 transition-colors"
                          aria-label={t('comment.edit')}
                          title={t('comment.edit')}
                        >
                          <i className="fas fa-edit" aria-hidden="true"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-base-04 hover:text-base-08 text-sm px-2 py-1 rounded hover:bg-base-08/10 transition-colors"
                          aria-label={t('comment.delete')}
                          title={t('comment.delete')}
                        >
                          <i className="fas fa-trash-alt" aria-hidden="true"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-base-05 whitespace-pre-wrap">{comment.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('comment.placeholder')}
          className="w-full px-4 py-3 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-sm bg-base-07 dark:bg-base-00 text-base-05 min-h-[100px] resize-y"
          rows="3"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="bg-base-0D text-base-07 px-4 py-2 rounded-md hover:bg-base-0D/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
              {t('common.posting')}
            </>
          ) : (
            <>
              <i className="fas fa-comment mr-2" aria-hidden="true"></i>
              {t('comment.add')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TaskComments;

