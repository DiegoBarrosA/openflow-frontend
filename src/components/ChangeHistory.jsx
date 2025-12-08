import React, { useState, useEffect } from 'react';
import { getTaskHistory, getBoardHistory } from '../services/api';
import { useTranslation } from '../contexts/I18nContext';

/**
 * ChangeHistory component - displays a timeline of changes for a task or board.
 * 
 * @param {string} entityType - 'task' or 'board'
 * @param {number} entityId - ID of the entity
 */
const ChangeHistory = ({ entityType, entityId }) => {
  const t = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!entityId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let data;
        if (entityType === 'task') {
          data = await getTaskHistory(entityId);
        } else if (entityType === 'board') {
          data = await getBoardHistory(entityId);
        }
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(t('history.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (isExpanded) {
      fetchHistory();
    }
  }, [entityType, entityId, isExpanded, t]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(t('common.locale', { defaultValue: 'en-US' }), {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return 'fa-plus-circle';
      case 'UPDATE':
        return 'fa-edit';
      case 'DELETE':
        return 'fa-trash';
      case 'MOVE':
        return 'fa-arrows-alt';
      default:
        return 'fa-file-alt';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-base-0B/20 text-base-0B';
      case 'UPDATE':
        return 'bg-base-0D/20 text-base-0D';
      case 'DELETE':
        return 'bg-base-08/20 text-base-08';
      case 'MOVE':
        return 'bg-base-0E/20 text-base-0E';
      default:
        return 'bg-base-03/20 text-base-04';
    }
  };

  const formatFieldChange = (entry) => {
    if (entry.action === 'CREATE') {
      return t('history.created');
    }
    if (entry.action === 'DELETE') {
      return t('history.deleted');
    }
    if (entry.action === 'MOVE') {
      return t('history.moved', { oldValue: entry.oldValue, newValue: entry.newValue });
    }
    if (entry.fieldName) {
      const oldVal = entry.oldValue || t('history.empty');
      const newVal = entry.newValue || t('history.empty');
      return (
        <span>
          {t('history.changed')} <strong>{entry.fieldName}</strong>: 
          <span className="line-through text-base-04 mx-1">{oldVal}</span>
          → <span className="text-base-0B">{newVal}</span>
        </span>
      );
    }
    return t('history.updated');
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-base-04 hover:text-base-05 transition-colors"
      >
        <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} transform transition-transform`} aria-hidden="true"></i>
        <span>{t('history.title')}</span>
        {history.length > 0 && !isExpanded && (
          <span className="bg-base-02 dark:bg-base-03 text-base-05 text-xs px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 pl-4 space-y-3">
          {loading && (
            <div className="text-sm text-base-04">
              <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
              {t('history.loading')}
            </div>
          )}
          
          {error && (
            <div className="text-sm text-base-08">
              <i className="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
              {error}
            </div>
          )}
          
          {!loading && !error && history.length === 0 && (
            <div className="text-sm text-base-04">{t('history.noHistory')}</div>
          )}
          
          {!loading && !error && history.map((entry) => (
            <div key={entry.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-base-03 dark:bg-base-02 rounded-full"></div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                    <i className={`fas ${getActionIcon(entry.action)} mr-1`} aria-hidden="true"></i>
                    {entry.action}
                  </span>
                  <span className="text-base-04 text-xs">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                
                <div className="text-base-05">
                  <span className="font-medium text-base-05">{entry.username || t('history.system')}</span>
                  {' '}
                  {formatFieldChange(entry)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChangeHistory;

