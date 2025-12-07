import React, { useState, useEffect } from 'react';
import { checkSubscription, subscribe, unsubscribe } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';

/**
 * SubscribeButton component - allows users to subscribe/unsubscribe to tasks or boards.
 * 
 * @param {string} entityType - 'TASK' or 'BOARD'
 * @param {number} entityId - ID of the entity
 * @param {string} size - 'sm' or 'md' (default)
 */
const SubscribeButton = ({ entityType, entityId, size = 'md' }) => {
  const { isAuthenticated } = useAuth();
  const t = useTranslation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated() && entityId) {
      fetchSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [entityType, entityId, isAuthenticated]);

  const fetchSubscriptionStatus = async () => {
    try {
      const result = await checkSubscription(entityType, entityId);
      setIsSubscribed(result.isSubscribed);
    } catch (err) {
      console.error('Failed to check subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!isAuthenticated()) return;
    
    setSaving(true);
    try {
      if (isSubscribed) {
        await unsubscribe(entityType, entityId);
        setIsSubscribed(false);
      } else {
        await subscribe(entityType, entityId, { emailEnabled: true, inAppEnabled: true });
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <button
        disabled
        className={`${size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} 
                   text-base-04 rounded border border-base-02 dark:border-base-03 bg-base-01 dark:bg-base-02`}
      >
        <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      className={`
        ${size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'}
        rounded border transition-all flex items-center gap-1
        ${isSubscribed 
          ? 'bg-base-0D/20 text-base-0D border-base-0D/30 hover:bg-base-0D/30' 
          : 'bg-base-07 dark:bg-base-01 text-base-05 border-base-02 dark:border-base-03 hover:bg-base-01 dark:hover:bg-base-02'
        }
        ${saving ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={isSubscribed ? t('board.unsubscribe') : t('board.subscribe')}
      aria-label={isSubscribed ? t('board.unsubscribe') : t('board.subscribe')}
    >
      {isSubscribed ? (
        <>
          <i className={`fas fa-bell ${size === 'sm' ? 'text-xs' : 'text-sm'}`} aria-hidden="true"></i>
          <span>{t('board.unsubscribe')}</span>
        </>
      ) : (
        <>
          <i className={`fas fa-bell-slash ${size === 'sm' ? 'text-xs' : 'text-sm'}`} aria-hidden="true"></i>
          <span>{t('board.subscribe')}</span>
        </>
      )}
    </button>
  );
};

export default SubscribeButton;

