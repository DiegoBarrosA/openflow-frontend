import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPublicBoards } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';

/**
 * Public board list - viewable without authentication.
 * Only shows boards marked as public.
 */
function PublicBoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const t = useTranslation();

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
      setError(t('board.failedToLoadPublicBoards'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-00">
      <main className="max-w-7xl mx-auto container-responsive py-6 sm:py-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-05">
            <i className="fas fa-globe mr-2" aria-hidden="true"></i>
            {t('board.publicBoards')}
          </h2>
          <p className="text-base-04 mt-2">{t('board.browsePublicBoards')}</p>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-20 text-base-04" role="status" aria-live="polite">
            <i className="fas fa-spinner fa-spin text-4xl mb-4" aria-hidden="true"></i>
            <p className="text-base sm:text-lg">{t('board.loadingPublicBoards')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-20 text-base-08" role="alert">
            <i className="fas fa-exclamation-circle text-4xl mb-4" aria-hidden="true"></i>
            <p className="text-base sm:text-lg">{error}</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-base-04" role="status" aria-live="polite">
            <i className="fas fa-inbox text-4xl mb-4" aria-hidden="true"></i>
            <p className="text-base sm:text-lg">{t('board.noPublicBoards')}</p>
            <p className="text-sm mt-2">{t('board.signInToCreate')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" role="list" aria-label={t('board.publicBoards')}>
            {boards.map((board) => (
              <article
                key={board.id}
                className="bg-base-07 dark:bg-base-01 rounded-lg shadow-md p-5 sm:p-6 hover:shadow-lg transition-shadow"
                role="listitem"
              >
                <h3
                  onClick={() => navigate(`/public/boards/${board.id}`)}
                  className="text-lg sm:text-xl font-semibold text-base-0D mb-2 cursor-pointer hover:text-base-0D/80 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 rounded"
                  tabIndex={0}
                  role="link"
                  aria-label={`${t('board.viewBoard')}: ${board.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/public/boards/${board.id}`);
                    }
                  }}
                >
                  <i className="fas fa-clipboard-list mr-2" aria-hidden="true"></i>
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-base-04 text-sm sm:text-base mb-4 line-clamp-2">{board.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-base-0B/20 text-base-0B">
                    <i className="fas fa-globe mr-1" aria-hidden="true"></i>
                    {t('board.public')}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/public/boards/${board.id}`)}
                  className="mt-4 w-full bg-base-0D text-base-07 px-4 py-2.5 sm:py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors text-sm shadow-sm font-medium"
                  aria-label={`${t('board.viewBoard')}: ${board.name}`}
                >
                  <i className="fas fa-door-open mr-2" aria-hidden="true"></i>
                  {t('board.viewBoard')}
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

