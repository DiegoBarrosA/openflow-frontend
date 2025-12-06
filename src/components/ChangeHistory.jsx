import React, { useState, useEffect } from 'react';
import { getTaskHistory, getBoardHistory } from '../services/api';

/**
 * ChangeHistory component - displays a timeline of changes for a task or board.
 * 
 * @param {string} entityType - 'task' or 'board'
 * @param {number} entityId - ID of the entity
 */
const ChangeHistory = ({ entityType, entityId }) => {
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
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    if (isExpanded) {
      fetchHistory();
    }
  }, [entityType, entityId, isExpanded]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      case 'MOVE':
        return '↔️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'MOVE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFieldChange = (entry) => {
    if (entry.action === 'CREATE') {
      return 'Created';
    }
    if (entry.action === 'DELETE') {
      return 'Deleted';
    }
    if (entry.action === 'MOVE') {
      return `Moved from status ${entry.oldValue} to ${entry.newValue}`;
    }
    if (entry.fieldName) {
      const oldVal = entry.oldValue || '(empty)';
      const newVal = entry.newValue || '(empty)';
      return (
        <span>
          Changed <strong>{entry.fieldName}</strong>: 
          <span className="line-through text-gray-400 mx-1">{oldVal}</span>
          → <span className="text-green-600">{newVal}</span>
        </span>
      );
    }
    return 'Updated';
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
        <span>History</span>
        {history.length > 0 && !isExpanded && (
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 border-l-2 border-gray-200 pl-4 space-y-3">
          {loading && (
            <div className="text-sm text-gray-500">Loading history...</div>
          )}
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          
          {!loading && !error && history.length === 0 && (
            <div className="text-sm text-gray-500">No history available</div>
          )}
          
          {!loading && !error && history.map((entry) => (
            <div key={entry.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                    {getActionIcon(entry.action)} {entry.action}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                
                <div className="text-gray-700">
                  <span className="font-medium text-gray-900">{entry.username || 'System'}</span>
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

