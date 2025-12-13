import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import {
  getAttachmentStatus,
  getTaskAttachments,
  uploadAttachment,
  getAttachmentDownloadUrl,
  deleteAttachment,
} from '../services/api';

function TaskAttachments({ taskId }) {
  const t = useTranslation();
  const [attachments, setAttachments] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkStatusAndFetch();
  }, [taskId]);

  const checkStatusAndFetch = async () => {
    try {
      setIsLoading(true);
      const status = await getAttachmentStatus();
      setIsEnabled(status.enabled);
      
      if (status.enabled) {
        const data = await getTaskAttachments(taskId);
        setAttachments(data);
      }
    } catch (err) {
      console.error('Error checking attachment status:', err);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      for (const file of files) {
        // Validate file size before upload (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          setError(t('attachment.fileTooLarge'));
          continue;
        }
        const attachment = await uploadAttachment(taskId, file);
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      
      // Handle specific error codes
      if (err.response?.status === 413) {
        setError(t('attachment.fileTooLarge'));
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(t('attachment.uploadFailed'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const { url } = await getAttachmentDownloadUrl(attachment.id);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error getting download URL:', err);
      setError(t('attachment.downloadFailed'));
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm(t('attachment.deleteConfirm'))) return;
    
    try {
      await deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError(t('attachment.deleteFailed'));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType) => {
    if (!contentType) return 'fa-file';
    if (contentType.startsWith('image/')) return 'fa-file-image';
    if (contentType.startsWith('video/')) return 'fa-file-video';
    if (contentType.startsWith('audio/')) return 'fa-file-audio';
    if (contentType.includes('pdf')) return 'fa-file-pdf';
    if (contentType.includes('word') || contentType.includes('document')) return 'fa-file-word';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'fa-file-excel';
    if (contentType.includes('zip') || contentType.includes('archive')) return 'fa-file-archive';
    return 'fa-file';
  };

  if (isLoading) {
    return (
      <div className="text-base-04 text-sm">
        <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
        {t('common.loading')}
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="text-base-04 text-sm italic">
        <i className="fas fa-cloud-upload-alt mr-2 opacity-50" aria-hidden="true"></i>
        {t('attachment.notEnabled')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-base-05">
          <i className="fas fa-paperclip mr-2" aria-hidden="true"></i>
          {t('attachment.title')} ({attachments.length})
        </h4>
      </div>

      {error && (
        <div className="text-sm text-base-08 bg-base-08/10 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-base-0D bg-base-0D/10' 
            : 'border-base-03 hover:border-base-0D hover:bg-base-01'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(Array.from(e.target.files))}
        />
        {isUploading ? (
          <div className="text-base-0D">
            <i className="fas fa-spinner fa-spin text-2xl mb-2" aria-hidden="true"></i>
            <p className="text-sm">{t('attachment.uploading')}</p>
          </div>
        ) : (
          <>
            <i className="fas fa-cloud-upload-alt text-2xl text-base-04 mb-2" aria-hidden="true"></i>
            <p className="text-sm text-base-04">
              {t('attachment.dragDrop')}
            </p>
            <p className="text-xs text-base-04 mt-1">
              {t('attachment.maxSize')}
            </p>
          </>
        )}
      </div>

      {/* Attachment List */}
      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-base-01 dark:bg-base-02 rounded-lg group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <i 
                  className={`fas ${getFileIcon(attachment.contentType)} text-base-0D text-lg`} 
                  aria-hidden="true"
                ></i>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-base-05 truncate" title={attachment.originalName}>
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-base-04">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-2 text-base-0D hover:bg-base-0D/20 rounded transition-colors"
                  title={t('attachment.download')}
                >
                  <i className="fas fa-download" aria-hidden="true"></i>
                </button>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="p-2 text-base-08 hover:bg-base-08/20 rounded transition-colors"
                  title={t('common.delete')}
                >
                  <i className="fas fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskAttachments;

