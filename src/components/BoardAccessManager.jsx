import React, { useState, useEffect } from 'react';
import { getBoardAccess, grantBoardAccess, updateBoardAccess, revokeBoardAccess, getAllUsers } from '../services/api';
import { useTranslation } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * BoardAccessManager - Component for managing board access and sharing.
 */
function BoardAccessManager({ boardId, boardOwnerId, onClose }) {
  const t = useTranslation();
  const { getUsername } = useAuth();
  const [accesses, setAccesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('READ');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentUsername = getUsername();

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [accessData, usersData] = await Promise.all([
        getBoardAccess(boardId),
        getAllUsers(),
      ]);
      setAccesses(accessData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('boardAccess.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const newAccess = await grantBoardAccess(boardId, parseInt(selectedUserId), selectedAccessLevel);
      setAccesses([...accesses, newAccess]);
      setSelectedUserId('');
      setSelectedAccessLevel('READ');
    } catch (err) {
      console.error('Error granting access:', err);
      setError(err.response?.data?.error || t('boardAccess.failedToGrant'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccess = async (userId, newLevel) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateBoardAccess(boardId, userId, newLevel);
      setAccesses(accesses.map(a => a.userId === userId ? updated : a));
    } catch (err) {
      console.error('Error updating access:', err);
      setError(err.response?.data?.error || t('boardAccess.failedToUpdate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccess = async (userId) => {
    if (!window.confirm(t('boardAccess.revokeConfirm'))) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await revokeBoardAccess(boardId, userId);
      setAccesses(accesses.filter(a => a.userId !== userId));
    } catch (err) {
      console.error('Error revoking access:', err);
      setError(err.response?.data?.error || t('boardAccess.failedToRevoke'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get users that don't already have access
  const availableUsers = users.filter(user => {
    // Don't show board owner
    if (user.id === boardOwnerId) return false;
    // Don't show users who already have access
    return !accesses.some(access => access.userId === user.id);
  });

  const getAccessLevelLabel = (level) => {
    switch (level) {
      case 'READ': return t('boardAccess.read');
      case 'WRITE': return t('boardAccess.write');
      case 'ADMIN': return t('boardAccess.admin');
      default: return level;
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'READ': return 'bg-base-04/20 text-base-04';
      case 'WRITE': return 'bg-base-0D/20 text-base-0D';
      case 'ADMIN': return 'bg-base-0E/20 text-base-0E';
      default: return 'bg-base-03/20 text-base-03';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-base-00/50 dark:bg-base-00/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-access-title"
    >
      <div
        className="bg-base-07 dark:bg-base-01 p-6 sm:p-8 rounded-lg w-full max-w-2xl shadow-lg border border-base-02 dark:border-base-03 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="board-access-title" className="text-xl sm:text-2xl font-bold text-base-05">
            <i className="fas fa-users mr-2" aria-hidden="true"></i>
            {t('boardAccess.manageAccess')}
          </h2>
          <button
            onClick={onClose}
            className="text-base-04 hover:text-base-05 text-2xl leading-none w-8 h-8 flex items-center justify-center hover:bg-base-01 dark:hover:bg-base-02 rounded-full transition-all"
            aria-label={t('common.close')}
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-base-08/20 text-base-08 rounded-md text-sm">
            <i className="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-base-04">
            <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
            {t('common.loading')}
          </div>
        ) : (
          <>
            {/* Grant Access Form */}
            <div className="mb-6 p-4 bg-base-01 dark:bg-base-02 rounded-lg border border-base-02 dark:border-base-03">
              <h3 className="text-lg font-semibold text-base-05 mb-4">
                <i className="fas fa-user-plus mr-2" aria-hidden="true"></i>
                {t('boardAccess.grantAccess')}
              </h3>
              <form onSubmit={handleGrantAccess} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="user-select" className="block text-sm font-medium text-base-05 mb-1">
                      {t('boardAccess.selectUser')}
                    </label>
                    <select
                      id="user-select"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-4 py-2 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base bg-base-07 dark:bg-base-00 text-base-05"
                      required
                    >
                      <option value="">-- {t('boardAccess.selectUser')} --</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="access-level-select" className="block text-sm font-medium text-base-05 mb-1">
                      {t('boardAccess.accessLevel')}
                    </label>
                    <select
                      id="access-level-select"
                      value={selectedAccessLevel}
                      onChange={(e) => setSelectedAccessLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base bg-base-07 dark:bg-base-00 text-base-05"
                      required
                    >
                      <option value="READ">{t('boardAccess.read')}</option>
                      <option value="WRITE">{t('boardAccess.write')}</option>
                      <option value="ADMIN">{t('boardAccess.admin')}</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedUserId}
                  className="bg-base-0D text-base-07 px-4 py-2 rounded-md hover:bg-base-0D/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2" aria-hidden="true"></i>
                      {t('boardAccess.grantAccess')}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Users with Access List */}
            <div>
              <h3 className="text-lg font-semibold text-base-05 mb-4">
                <i className="fas fa-users-cog mr-2" aria-hidden="true"></i>
                {t('boardAccess.usersWithAccess')}
              </h3>
              {accesses.length === 0 ? (
                <p className="text-base-04 text-sm text-center py-4">{t('boardAccess.noUsersWithAccess')}</p>
              ) : (
                <div className="space-y-2">
                  {accesses.map((access) => (
                    <div
                      key={access.id}
                      className="flex items-center justify-between p-3 bg-base-01 dark:bg-base-02 rounded-lg border border-base-02 dark:border-base-03"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-base-0D flex items-center justify-center text-base-07 font-semibold">
                          {access.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-base-05">{access.username}</p>
                          <p className="text-xs text-base-04">
                            {t('boardAccess.grantedBy')} {access.grantedByUsername}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={access.accessLevel}
                            onChange={(e) => handleUpdateAccess(access.userId, e.target.value)}
                            disabled={isSubmitting}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium border border-base-03 dark:border-base-02 focus:outline-none focus:ring-2 focus:ring-base-0D bg-base-07 dark:bg-base-00 text-base-05 ${getAccessLevelColor(access.accessLevel)}`}
                          >
                            <option value="READ">{t('boardAccess.read')}</option>
                            <option value="WRITE">{t('boardAccess.write')}</option>
                            <option value="ADMIN">{t('boardAccess.admin')}</option>
                          </select>
                          <button
                            onClick={() => handleRevokeAccess(access.userId)}
                            disabled={isSubmitting}
                            className="text-base-08 hover:text-base-08/80 hover:bg-base-08/10 px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-50"
                            aria-label={t('boardAccess.revoke')}
                            title={t('boardAccess.revoke')}
                          >
                            <i className="fas fa-times" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BoardAccessManager;

