import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPublicBoards } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Public board list - viewable without authentication.
 * Only shows boards marked as public.
 */
function PublicBoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, getUsername } = useAuth();
  const username = getUsername();

  useEffect(() => {
    fetchPublicBoards();
  }, []);

  const fetchPublicBoards = async () => {
    try {
      setLoading(true);
      const data = await getPublicBoards();
      setBoards(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching public boards:', err);
      setError('Failed to load public boards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-[#F5F5F5] text-gray-700 container-responsive py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#82AAFF]">OpenFlow</h1>
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
              <>
                <Link
                  to="/login"
                  className="bg-[#82AAFF] text-white px-4 py-2 rounded-md hover:bg-[#6B8FE8] transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto container-responsive py-6 sm:py-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-700">Public Boards</h2>
          <p className="text-gray-500 mt-2">Browse boards shared publicly. Sign in to create and manage your own boards.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-20 text-gray-600" role="status" aria-live="polite">
            <p className="text-base sm:text-lg">Loading public boards...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-20 text-red-600" role="alert">
            <p className="text-base sm:text-lg">{error}</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-gray-600" role="status" aria-live="polite">
            <p className="text-base sm:text-lg">No public boards available.</p>
            <p className="text-sm mt-2">Sign in to create your own boards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" role="list" aria-label="List of public boards">
            {boards.map((board) => (
              <article
                key={board.id}
                className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-[#88D8C0]"
                role="listitem"
              >
                <h3
                  onClick={() => navigate(`/public/boards/${board.id}`)}
                  className="text-lg sm:text-xl font-semibold text-[#82AAFF] mb-2 cursor-pointer hover:text-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 rounded"
                  tabIndex={0}
                  role="link"
                  aria-label={`View board: ${board.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/public/boards/${board.id}`);
                    }
                  }}
                >
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">{board.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/public/boards/${board.id}`)}
                  className="mt-4 w-full bg-[#82AAFF] text-white px-4 py-2.5 sm:py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors text-sm shadow-sm font-medium"
                  aria-label={`View board: ${board.name}`}
                >
                  View Board
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicBoardList;

