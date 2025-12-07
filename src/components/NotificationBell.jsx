import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';

/**
 * NotificationBell component - displays notification icon with unread count and dropdown panel.
 */
const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const t = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('common.justNow');
    if (minutes < 60) return `${minutes}${t('common.minutesAgo')}`;
    if (hours < 24) return `${hours}${t('common.hoursAgo')}`;
    if (days < 7) return `${days}${t('common.daysAgo')}`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    if (type.includes('TASK')) return 'fa-clipboard-list';
    if (type.includes('BOARD')) return 'fa-th-large';
    if (type.includes('STATUS')) return 'fa-tag';
    return 'fa-bell';
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-base-04 hover:text-base-05 hover:bg-base-01 dark:hover:bg-base-02 rounded-full transition-colors"
        aria-label={`${t('board.notifications')}${unreadCount > 0 ? ` (${unreadCount} ${t('common.unread')})` : ''}`}
      >
        <i className="fas fa-bell text-xl" aria-hidden="true"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-base-08 text-base-07 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-base-07 dark:bg-base-01 rounded-lg shadow-lg border border-base-02 dark:border-base-03 z-50 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="p-3 border-b border-base-02 dark:border-base-03 flex justify-between items-center">
            <h3 className="font-semibold text-base-05">
              <i className="fas fa-bell mr-2" aria-hidden="true"></i>
              {t('board.notifications')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-base-0D hover:text-base-0D/80"
              >
                {t('board.markAllAsRead')}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-base-04">
                <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                {t('common.loading')}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-base-04">
                <i className="fas fa-bell-slash text-4xl mb-2" aria-hidden="true"></i>
                <p>{t('board.noNotifications')}</p>
              </div>
            ) : (
              <div className="divide-y divide-base-02 dark:divide-base-03">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-base-01 dark:hover:bg-base-02 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-base-0D/10 dark:bg-base-0D/20' : ''
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <i className={`fas ${getNotificationIcon(notification.type)} text-lg text-base-0D mt-1`} aria-hidden="true"></i>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''} text-base-05 line-clamp-2`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-base-04">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.referenceType && (
                            <span className="text-xs text-base-04">
                              {notification.referenceType} #{notification.referenceId}
                            </span>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-base-0D rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

