import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import {
  getCurrentUser,
  uploadProfilePicture,
  deleteProfilePicture,
} from '../services/api';

function ProfileModal({ onClose }) {
  const t = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setIsLoading(true);
      const data = await getCurrentUser();
      setUser(data);
      setPreviewUrl(data.profilePictureUrl);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError(t('profile.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('profile.invalidFileType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('profile.fileTooLarge'));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { url } = await uploadProfilePicture(file);
      setPreviewUrl(url);
      setUser(prev => ({ ...prev, profilePictureUrl: url }));
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      
      // Handle specific error codes
      if (err.response?.status === 413) {
        setError(t('profile.fileTooLarge'));
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || t('profile.invalidFileType'));
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(t('profile.uploadFailed'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm(t('profile.deleteConfirm'))) return;

    try {
      await deleteProfilePicture();
      setPreviewUrl(null);
      setUser(prev => ({ ...prev, profilePictureUrl: null }));
    } catch (err) {
      console.error('Error deleting profile picture:', err);
      setError(t('profile.deleteFailed'));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div
        className="bg-base-07 dark:bg-base-01 rounded-xl w-full max-w-md shadow-2xl border border-base-02 dark:border-base-03 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-02 dark:border-base-03 bg-gradient-to-r from-base-0D/10 to-base-0E/10">
          <h2 id="profile-title" className="text-xl font-bold text-base-05">
            <i className="fas fa-user-circle mr-2" aria-hidden="true"></i>
            {t('profile.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-base-04 hover:text-base-05 text-2xl w-8 h-8 flex items-center justify-center hover:bg-base-01 dark:hover:bg-base-02 rounded-full transition-all"
            aria-label={t('common.close')}
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-base-0D" aria-hidden="true"></i>
              <p className="text-base-04 mt-2">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="text-sm text-base-08 bg-base-08/10 px-4 py-3 rounded-lg">
                  <i className="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
                  {error}
                </div>
              )}

              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={t('profile.picture')}
                      className="w-32 h-32 rounded-full object-cover border-4 border-base-0D shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-base-0D flex items-center justify-center text-base-07 text-4xl font-bold border-4 border-base-0D shadow-lg">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  {/* Upload Overlay */}
                  <div
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <i className="fas fa-spinner fa-spin text-2xl text-white" aria-hidden="true"></i>
                    ) : (
                      <i className="fas fa-camera text-2xl text-white" aria-hidden="true"></i>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 text-sm bg-base-0D text-base-07 rounded-lg hover:bg-base-0D/90 transition-colors disabled:opacity-50"
                  >
                    <i className="fas fa-upload mr-2" aria-hidden="true"></i>
                    {t('profile.uploadPicture')}
                  </button>
                  {previewUrl && (
                    <button
                      onClick={handleDeletePicture}
                      className="px-4 py-2 text-sm text-base-08 hover:bg-base-08/10 rounded-lg transition-colors"
                    >
                      <i className="fas fa-trash mr-2" aria-hidden="true"></i>
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4 border-t border-base-02 dark:border-base-03 pt-6">
                <div>
                  <label className="block text-xs text-base-04 uppercase tracking-wide mb-1">
                    {t('profile.username')}
                  </label>
                  <p className="text-base-05 font-medium">{user?.username}</p>
                </div>
                <div>
                  <label className="block text-xs text-base-04 uppercase tracking-wide mb-1">
                    {t('profile.email')}
                  </label>
                  <p className="text-base-05">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-xs text-base-04 uppercase tracking-wide mb-1">
                    {t('profile.role')}
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'ADMIN' 
                      ? 'bg-base-0E/20 text-base-0E' 
                      : 'bg-base-0D/20 text-base-0D'
                  }`}>
                    {user?.role === 'ADMIN' ? t('board.admin') : t('board.user')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-base-02 dark:border-base-03 bg-base-01 dark:bg-base-02">
          <button
            onClick={onClose}
            className="px-6 py-2 text-base-05 hover:bg-base-02 dark:hover:bg-base-03 rounded-lg transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;

