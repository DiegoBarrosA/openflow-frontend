import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublicBoard, getPublicBoardStatuses, getPublicBoardTasks } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { useBoardActions } from '../contexts/BoardActionsContext';

/**
 * Public board view - read-only, no authentication required.
 */
function PublicBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const t = useTranslation();
  const { setBoardActions } = useBoardActions();
  const [board, setBoard] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBoardData();
  }, [id]);

  // Set board data for NavigationBar
  useEffect(() => {
    if (board) {
      setBoardActions({
        boardId: parseInt(id),
        boardName: board.name,
        boardBadges: [{ type: 'publicReadOnly', label: t('board.publicReadOnly'), icon: 'fa-lock' }],
        showBackButton: true,
        backTo: '/public/boards',
        adminActions: null,
      });
    } else {
      setBoardActions(null);
    }

    return () => {
      setBoardActions(null);
    };
  }, [board, id, setBoardActions, t]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const [boardData, statusesData, tasksData] = await Promise.all([
        getPublicBoard(id),
        getPublicBoardStatuses(id),
        getPublicBoardTasks(id),
      ]);
      setBoard(boardData);
      setStatuses(statusesData);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      console.error('Error fetching board:', err);
      if (err.response?.status === 404) {
        setError(t('board.boardNotFound'));
      } else {
        setError(t('board.failedToLoadBoard'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (statusId) => {
    return tasks.filter((task) => task.statusId === statusId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-00" role="status" aria-live="polite">
        <div className="text-base-05">
          <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
          {t('board.loadingBoard')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-00">
        <div className="text-center py-12 sm:py-20 text-base-08" role="alert">
          <i className="fas fa-exclamation-circle text-4xl mb-4" aria-hidden="true"></i>
          <p className="text-base sm:text-lg">{error}</p>
          <button
            onClick={() => navigate('/public/boards')}
            className="mt-4 bg-base-0D text-base-07 px-4 py-2 rounded-md hover:bg-base-0D/90"
          >
            {t('board.goToPublicBoards')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-00">
      {board?.description && (
        <div className="max-w-7xl mx-auto container-responsive py-2">
          <p className="text-base-04">{board.description}</p>
        </div>
        )}

      <main className="max-w-full mx-auto container-responsive py-6 sm:py-8 overflow-x-auto">
        {statuses.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-base-04" role="status" aria-live="polite">
            <i className="fas fa-columns text-4xl mb-4" aria-hidden="true"></i>
            <p className="text-base sm:text-lg">{t('board.noColumnsYet')}</p>
          </div>
        ) : (
          <div
            className="flex gap-4 sm:gap-6 pb-4"
            role="list"
            aria-label={t('board.title')}
            style={{ minWidth: 'max-content' }}
          >
            {statuses.map((status) => (
              <div
                key={status.id}
                className="bg-base-07 dark:bg-base-01 rounded-lg shadow-sm p-4 w-72 sm:w-80 flex-shrink-0"
                role="listitem"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="font-semibold text-base-05 flex items-center gap-2"
                    style={{ borderLeft: `4px solid ${status.color || '#82AAFF'}`, paddingLeft: '8px' }}
                  >
                    {status.name}
                    <span className="text-xs text-base-04 font-normal">
                      ({getTasksByStatus(status.id).length})
                    </span>
                  </h3>
                </div>

                <div className="min-h-[50px] space-y-2" role="list" aria-label={`${t('task.title')} ${t('common.in')} ${status.name}`}>
                  {getTasksByStatus(status.id).map((task) => (
                    <article
                      key={task.id}
                      className="bg-base-01 dark:bg-base-02 rounded-md p-3 shadow-sm"
                      role="listitem"
                    >
                      <h4 className="font-medium text-base-05 text-sm">{task.title}</h4>
                      {task.description && (
                        <p className="text-base-04 text-xs mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </article>
                  ))}
                  {getTasksByStatus(status.id).length === 0 && (
                    <p className="text-base-04 text-sm text-center py-4">{t('board.noTasksInColumn')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicBoard;

