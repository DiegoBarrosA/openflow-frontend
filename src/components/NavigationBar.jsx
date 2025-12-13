import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { useBoardActions } from '../contexts/BoardActionsContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';
import SubscribeButton from './SubscribeButton';
import ProfileModal from './ProfileModal';
import api, { azureLogin, getCurrentUser } from '../services/api';

/**
 * Unified NavigationBar component - context-aware navigation that adapts to current route
 */
function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { isAuthenticated, isAdmin, getUsername, getRole, logout } = useAuth();
  const t = useTranslation();
  const { boardData } = useBoardActions();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [board, setBoard] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const menuRef = useRef(null);

  const username = getUsername();
  const role = getRole();
  const boardId = params.id;
  const isBoardView = location.pathname.startsWith('/boards/') && boardId;
  const isPublicBoardView = location.pathname.startsWith('/public/boards/') && boardId;
  const isOAuthCallback = location.pathname === '/oauth-callback';
  const isBoardsList = location.pathname === '/boards';
  const isPublicBoardsList = location.pathname === '/public/boards';

  const fetchBoard = React.useCallback(async () => {
    if (!boardId) return;
    try {
      const endpoint = isPublicBoardView ? `/boards/public/${boardId}` : `/boards/${boardId}`;
      const response = await api.get(endpoint);
      setBoard(response.data);
    } catch (err) {
      console.error('Error fetching board:', err);
    }
  }, [boardId, isPublicBoardView]);

  // Fetch board data if we're on a board view and don't have it
  useEffect(() => {
    if ((isBoardView || isPublicBoardView) && !board && boardId) {
      fetchBoard();
    }
  }, [isBoardView, isPublicBoardView, boardId, board, fetchBoard]);

  // Fetch user profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (isAuthenticated()) {
        try {
          const user = await getCurrentUser();
          setProfilePictureUrl(user.profilePictureUrl);
        } catch (err) {
          console.error('Error fetching profile picture:', err);
        }
      }
    };
    fetchProfilePicture();
  }, [isAuthenticated]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/public/boards');
  };

  const getHomeRoute = () => {
    if (isAuthenticated()) {
      return '/boards';
    }
    return '/public/boards';
  };

  const getBackRoute = () => {
    if (boardData?.backTo) return boardData.backTo;
    if (isBoardView) return '/boards';
    if (isPublicBoardView) return '/public/boards';
    return '/public/boards';
  };

  const displayBoardName = boardData?.boardName || board?.name;
  const displayBadges = boardData?.boardBadges?.length > 0 ? boardData.boardBadges : [
    ...(isPublicBoardView ? [{ type: 'publicReadOnly', label: t('board.publicReadOnly'), icon: 'fa-lock' }] : []),
    ...(board?.isPublic && !isPublicBoardView ? [{ type: 'public', label: t('board.public'), icon: 'fa-globe' }] : []),
    ...(board?.isTemplate ? [{ type: 'template', label: t('board.template'), icon: 'fa-copy' }] : [])
  ];

  // Minimal header for OAuth callback
  if (isOAuthCallback) {
    return (
      <header className="bg-base-00 text-base-05 container-responsive py-4 sm:py-5 border-b border-base-02 dark:border-base-03">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to={getHomeRoute()}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-base-0D hover:text-base-0D/80 transition-colors"
          >
            <i className="fas fa-project-diagram mr-2" aria-hidden="true"></i>
            OpenFlow
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-base-00 text-base-05 container-responsive py-4 sm:py-5 border-b border-base-02 dark:border-base-03">
      <div className={`${isBoardView || isPublicBoardView ? 'max-w-full' : 'max-w-7xl'} mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4`}>
        {/* Left side: Logo/Back button + Title */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {(boardData?.showBackButton || isBoardView || isPublicBoardView) && (
            <button
              onClick={() => navigate(getBackRoute())}
              className="p-2 rounded-md hover:bg-base-01 dark:hover:bg-base-02 transition-colors flex-shrink-0"
              aria-label={t('common.back')}
            >
              <i className="fas fa-arrow-left text-base-05" aria-hidden="true"></i>
            </button>
          )}
          
          {!isBoardView && !isPublicBoardView && (
            <Link
              to={getHomeRoute()}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-base-0D hover:text-base-0D/80 transition-colors"
            >
              <i className="fas fa-project-diagram mr-2" aria-hidden="true"></i>
              OpenFlow
            </Link>
          )}

          {displayBoardName && (
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate flex-1 text-base-0D">
              {displayBoardName}
            </h1>
          )}

          {/* Board badges */}
          {displayBadges.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {displayBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    badge.type === 'public' || badge.type === 'publicReadOnly'
                      ? 'bg-base-0B/20 text-base-0B'
                      : badge.type === 'template'
                      ? 'bg-base-0E/20 text-base-0E'
                      : 'bg-base-0D/20 text-base-0D'
                  }`}
                >
                  <i className={`fas ${badge.icon || 'fa-tag'} mr-1`} aria-hidden="true"></i>
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Actions, controls, user menu */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Board-specific actions (admin controls) from context */}
          {boardData?.adminActions}

          {/* Subscribe button for board views */}
          {(isBoardView || isPublicBoardView) && boardId && isAuthenticated() && (
            <SubscribeButton entityType="BOARD" entityId={parseInt(boardId)} size="sm" />
          )}

          {/* Public boards list: Show link to my boards if authenticated */}
          {isPublicBoardsList && isAuthenticated() && (
            <Link
              to="/boards"
              className="bg-base-0D text-base-07 px-4 py-2 rounded-md hover:bg-base-0D/90 transition-colors text-sm font-medium"
            >
              <i className="fas fa-th-large mr-2" aria-hidden="true"></i>
              {t('board.myBoards')}
            </Link>
          )}

          {/* Boards list: Show link to public boards */}
          {isBoardsList && (
            <Link
              to="/public/boards"
              className="text-base-04 hover:text-base-0D text-sm font-medium transition-colors"
            >
              <i className="fas fa-globe mr-1" aria-hidden="true"></i>
              {t('board.publicBoards')}
            </Link>
          )}

          {/* Public boards: Show Microsoft SSO login if not authenticated */}
          {(isPublicBoardsList || isPublicBoardView) && !isAuthenticated() && (
            <>
              <button
                onClick={azureLogin}
                className="bg-base-0D text-base-07 px-4 py-2 rounded-md hover:bg-base-0D/90 transition-colors text-sm font-medium"
                aria-label={t('auth.login.signInWithMicrosoft')}
              >
                <i className="fab fa-microsoft mr-2" aria-hidden="true"></i>
                {t('board.signIn')}
              </button>
              <button
                onClick={azureLogin}
                className="bg-base-01 dark:bg-base-02 text-base-05 px-4 py-2 rounded-md hover:bg-base-02 dark:hover:bg-base-03 transition-colors text-sm font-medium"
                aria-label={t('auth.login.signInWithMicrosoft')}
              >
                <i className="fab fa-microsoft mr-2" aria-hidden="true"></i>
                {t('common.register')}
              </button>
            </>
          )}

          {/* Public board view: Show my boards if authenticated */}
          {isPublicBoardView && isAuthenticated() && (
            <Link
              to="/boards"
              className="bg-base-0D text-base-07 px-4 py-2 rounded-md hover:bg-base-0D/90 transition-colors text-sm font-medium"
            >
              <i className="fas fa-th-large mr-2" aria-hidden="true"></i>
              {t('board.myBoards')}
            </Link>
          )}

          {/* Theme switcher (only when not authenticated) */}
          {!isAuthenticated() && <ThemeSwitcher />}

          {/* Notifications (only when authenticated) */}
          {isAuthenticated() && <NotificationBell />}

          {/* User menu (only when authenticated) */}
          {isAuthenticated() && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-base-01 dark:hover:bg-base-02 transition-colors touch-target"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={username}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-base-0D"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-base-0D flex items-center justify-center text-base-07 font-semibold text-sm sm:text-base">
                    {username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'} text-base-04`} aria-hidden="true"></i>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-base-07 dark:bg-base-01 rounded-md shadow-lg border border-base-02 dark:border-base-03 py-2 z-50">
                  <div className="px-4 py-3 border-b border-base-02 dark:border-base-03">
                    <div className="flex items-center gap-3">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt={username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-base-0D"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-base-0D flex items-center justify-center text-base-07 font-semibold">
                          {username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-base-05 truncate max-w-[120px]" title={username}>{username}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          role === ROLES.ADMIN 
                            ? 'bg-base-0E/20 text-base-0E' 
                            : 'bg-base-0D/20 text-base-0D'
                        }`}>
                          {role === ROLES.ADMIN ? t('board.admin') : t('board.user')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-base-05 hover:bg-base-01 dark:hover:bg-base-02 transition-colors"
                  >
                    <i className="fas fa-user-circle mr-2" aria-hidden="true"></i>
                    {t('profile.myProfile')}
                  </button>
                  <div className="px-4 py-2 border-b border-base-02 dark:border-base-03">
                    <LanguageSwitcher />
                  </div>
                  <div className="px-4 py-2 border-b border-base-02 dark:border-base-03">
                    <ThemeSwitcher inMenu={true} />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-base-05 hover:bg-base-01 dark:hover:bg-base-02 transition-colors"
                    aria-label={t('common.logout')}
                  >
                    <i className="fas fa-sign-out-alt mr-2" aria-hidden="true"></i>
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => {
            setShowProfileModal(false);
            // Refresh profile picture after modal closes
            getCurrentUser().then(user => setProfilePictureUrl(user.profilePictureUrl)).catch(() => {});
          }}
        />
      )}
    </header>
  );
}

export default NavigationBar;

