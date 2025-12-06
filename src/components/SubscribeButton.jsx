import React, { useState, useEffect } from 'react';
import { checkSubscription, subscribe, unsubscribe } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * SubscribeButton component - allows users to subscribe/unsubscribe to tasks or boards.
 * 
 * @param {string} entityType - 'TASK' or 'BOARD'
 * @param {number} entityId - ID of the entity
 * @param {string} size - 'sm' or 'md' (default)
 */
const SubscribeButton = ({ entityType, entityId, size = 'md' }) => {
  const { isAuthenticated } = useAuth();
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
                   text-gray-400 rounded border border-gray-200`}
      >
        ...
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
          ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' 
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
        }
        ${saving ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to notifications'}
    >
      {isSubscribed ? (
        <>
          <svg className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span>Subscribed</span>
        </>
      ) : (
        <>
          <svg className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>Subscribe</span>
        </>
      )}
    </button>
  );
};

export default SubscribeButton;

