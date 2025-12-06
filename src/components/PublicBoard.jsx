import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublicBoard, getPublicBoardStatuses, getPublicBoardTasks } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Public board view - read-only, no authentication required.
 */
function PublicBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getUsername } = useAuth();
  const username = getUsername();
  const [board, setBoard] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBoardData();
  }, [id]);

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
        setError('Board not found or is not public');
      } else {
        setError('Failed to load board');
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]" role="status" aria-live="polite">
        <div className="text-gray-600">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <header className="bg-[#F5F5F5] text-gray-700 container-responsive py-4 sm:py-5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#82AAFF]">OpenFlow</h1>
            <Link
              to="/public/boards"
              className="text-[#82AAFF] hover:text-[#6B8FE8] font-medium"
            >
              Back to Public Boards
            </Link>
          </div>
        </header>
        <div className="text-center py-12 sm:py-20 text-red-600" role="alert">
          <p className="text-base sm:text-lg">{error}</p>
          <button
            onClick={() => navigate('/public/boards')}
            className="mt-4 bg-[#82AAFF] text-white px-4 py-2 rounded-md hover:bg-[#6B8FE8]"
          >
            Go to Public Boards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-[#F5F5F5] text-gray-700 container-responsive py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/public/boards')}
              className="text-[#82AAFF] hover:text-[#6B8FE8] font-medium flex items-center gap-1"
              aria-label="Back to public boards"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#82AAFF]">
              {board?.name}
            </h1>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Public (Read-only)
            </span>
          </div>
          <div className="flex gap-3 items-center">
            {isAuthenticated() ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#88D8C0] flex items-center justify-center text-gray-800 font-semibold text-sm">
                    {username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-700 text-sm font-medium hidden sm:block">
                    {username}
                  </span>
                </div>
                <Link
                  to="/boards"
                  className="bg-[#82AAFF] text-white px-4 py-2 rounded-md hover:bg-[#6B8FE8] transition-colors text-sm font-medium"
                >
                  My Boards
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-[#82AAFF] text-white px-4 py-2 rounded-md hover:bg-[#6B8FE8] transition-colors text-sm font-medium"
              >
                Sign In to Edit
              </Link>
            )}
          </div>
        </div>
        {board?.description && (
          <p className="max-w-7xl mx-auto text-gray-500 mt-2">{board.description}</p>
        )}
      </header>

      <main className="max-w-full mx-auto container-responsive py-6 sm:py-8 overflow-x-auto">
        {statuses.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-gray-600" role="status" aria-live="polite">
            <p className="text-base sm:text-lg">No columns yet.</p>
          </div>
        ) : (
          <div
            className="flex gap-4 sm:gap-6 pb-4"
            role="list"
            aria-label="Board columns"
            style={{ minWidth: 'max-content' }}
          >
            {statuses.map((status) => (
              <div
                key={status.id}
                className="bg-white rounded-lg shadow-sm p-4 w-72 sm:w-80 flex-shrink-0"
                role="listitem"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="font-semibold text-gray-700 flex items-center gap-2"
                    style={{ borderLeft: `4px solid ${status.color || '#82AAFF'}`, paddingLeft: '8px' }}
                  >
                    {status.name}
                    <span className="text-xs text-gray-400 font-normal">
                      ({getTasksByStatus(status.id).length})
                    </span>
                  </h3>
                </div>

                <div className="min-h-[50px] space-y-2" role="list" aria-label={`Tasks in ${status.name}`}>
                  {getTasksByStatus(status.id).map((task) => (
                    <article
                      key={task.id}
                      className="bg-gray-50 rounded-md p-3 shadow-sm border-l-4 border-[#82AAFF]"
                      role="listitem"
                    >
                      <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                      {task.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </article>
                  ))}
                  {getTasksByStatus(status.id).length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No tasks</p>
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

