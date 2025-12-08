import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getTemplates, createBoardFromTemplate } from '../services/api';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';

function BoardList() {
  const [boards, setBoards] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardIsPublic, setNewBoardIsPublic] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateBoardName, setTemplateBoardName] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const t = useTranslation();

  useEffect(() => {
    fetchBoards();
    if (isAdmin()) {
      fetchTemplates();
    }
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data);
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/boards', {
        name: newBoardName,
        description: newBoardDescription,
        isPublic: newBoardIsPublic,
      });
      setBoards([...boards, response.data]);
      setNewBoardName('');
      setNewBoardDescription('');
      setNewBoardIsPublic(false);
      setShowCreateForm(false);
      navigate(`/boards/${response.data.id}`);
    } catch (err) {
      console.error('Error creating board:', err);
    }OpenFlow
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm(t('board.deleteBoardConfirm'))) {
      return;
    }
    try {
      await api.delete(`/boards/${id}`);
      setBoards(boards.filter((board) => board.id !== id));
    } catch (err) {
      console.error('Error deleting board:', err);
    }
  };

  const handleCreateFromTemplate = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId || !templateBoardName.trim()) return;
    
    try {
      const newBoard = await createBoardFromTemplate(selectedTemplateId, templateBoardName);
      setBoards([...boards, newBoard]);
      setTemplateBoardName('');
      setSelectedTemplateId(null);
      setShowTemplateForm(false);
      navigate(`/boards/${newBoard.id}`);
    } catch (err) {
      console.error('Error creating board from template:', err);
    }
  };

  return (
    <div className="min-h-screen bg-base-00">
      <main className="max-w-7xl mx-auto container-responsive py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-05">
            <i className="fas fa-th-large mr-2" aria-hidden="true"></i>
            {t('board.myBoards')}
          </h2>
          {/* Only show Create Board buttons for Admins */}
          {isAdmin() && (
            <div className="flex gap-2 w-full sm:w-auto">
              {templates.length > 0 && (
                <button
                  onClick={() => {
                    setShowTemplateForm(!showTemplateForm);
                    setShowCreateForm(false);
                  }}
                  className="bg-base-0E text-base-07 px-4 sm:px-5 py-2.5 sm:py-2 rounded-md hover:bg-base-0E/90 focus:outline-none focus:ring-2 focus:ring-base-0E focus:ring-offset-2 transition-colors shadow-md touch-target flex-1 sm:flex-none text-sm sm:text-base font-medium"
                  aria-label={showTemplateForm ? t('common.cancel') : t('board.fromTemplate')}
                >
                  <i className={`fas fa-${showTemplateForm ? 'times' : 'copy'} mr-2`} aria-hidden="true"></i>
                  {showTemplateForm ? t('common.cancel') : t('board.fromTemplate')}
                </button>
              )}
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setShowTemplateForm(false);
                }}
                className="bg-base-0D text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md touch-target flex-1 sm:flex-none text-sm sm:text-base font-medium"
                aria-label={showCreateForm ? t('common.cancel') : t('board.createBoard')}
                aria-expanded={showCreateForm}
              >
                <i className={`fas fa-${showCreateForm ? 'times' : 'plus'} mr-2`} aria-hidden="true"></i>
                {showCreateForm ? t('common.cancel') : t('board.createBoard')}
              </button>
            </div>
          )}
        </div>

        {/* Only show create form for Admins */}
        {isAdmin() && showCreateForm && (
          <form 
            onSubmit={handleCreateBoard} 
            className="bg-base-07 dark:bg-base-01 p-5 sm:p-6 rounded-lg shadow-sm mb-6 border border-base-02 dark:border-base-03"
            aria-label={t('board.createBoard')}
          >
            <div className="mb-4">
              <label htmlFor="board-name" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                <i className="fas fa-tag mr-2" aria-hidden="true"></i>
                {t('board.boardName')}
              </label>
              <input
                id="board-name"
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
                required
                aria-required="true"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="board-description" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                <i className="fas fa-align-left mr-2" aria-hidden="true"></i>
                {t('board.description')}
              </label>
              <textarea
                id="board-description"
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent min-h-[80px] resize-y text-base bg-base-07 dark:bg-base-00 text-base-05"
                aria-label={t('board.description')}
              />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                id="board-public"
                type="checkbox"
                checked={newBoardIsPublic}
                onChange={(e) => setNewBoardIsPublic(e.target.checked)}
                className="w-4 h-4 text-base-0D border-base-03 dark:border-base-02 rounded focus:ring-base-0D"
              />
              <label htmlFor="board-public" className="text-sm sm:text-base font-medium text-base-05">
                {t('board.makePublic')}
              </label>
            </div>
            <button
              type="submit"
              className="bg-base-0D text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md touch-target text-sm sm:text-base font-medium"
              aria-label={t('common.create')}
            >
              <i className="fas fa-check mr-2" aria-hidden="true"></i>
              {t('common.create')}
            </button>
          </form>
        )}

        {/* Template selection form - only for Admins */}
        {isAdmin() && showTemplateForm && (
          <form 
            onSubmit={handleCreateFromTemplate} 
            className="bg-base-07 dark:bg-base-01 p-5 sm:p-6 rounded-lg shadow-sm mb-6 border border-base-0E"
            aria-label={t('board.createFromTemplate')}
          >
            <h3 className="text-lg font-semibold text-base-05 mb-4">
              <i className="fas fa-copy mr-2" aria-hidden="true"></i>
              {t('board.createFromTemplate')}
            </h3>
            <div className="mb-4">
              <label htmlFor="template-select" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                {t('board.selectTemplate')}
              </label>
              <select
                id="template-select"
                value={selectedTemplateId || ''}
                onChange={(e) => setSelectedTemplateId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0E focus:border-transparent text-base bg-base-07 dark:bg-base-00 text-base-05"
                required
              >
                <option value="">{t('board.selectTemplatePlaceholder')}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="template-board-name" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
                {t('board.newBoardName')}
              </label>
              <input
                id="template-board-name"
                type="text"
                value={templateBoardName}
                onChange={(e) => setTemplateBoardName(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0E focus:border-transparent text-base bg-base-07 dark:bg-base-00 text-base-05"
                placeholder={t('board.newBoardNamePlaceholder')}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-base-0E text-base-07 px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-base-0E/90 focus:outline-none focus:ring-2 focus:ring-base-0E focus:ring-offset-2 transition-colors shadow-md touch-target text-sm sm:text-base font-medium"
              aria-label={t('board.createFromTemplate')}
            >
              <i className="fas fa-check mr-2" aria-hidden="true"></i>
              {t('board.createFromTemplate')}
            </button>
          </form>
        )}

        {boards.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-base-04" role="status" aria-live="polite">
            <i className="fas fa-inbox text-4xl mb-4" aria-hidden="true"></i>
            <p className="text-base sm:text-lg">
              {isAdmin() 
                ? t('board.noBoardsAdmin')
                : t('board.noBoardsUser')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" role="list" aria-label={t('board.myBoards')}>
            {boards.map((board) => (
              <article
                key={board.id}
                className="bg-base-07 dark:bg-base-01 rounded-lg shadow-md p-5 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-base-0C"
                role="listitem"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3
                    onClick={() => navigate(`/boards/${board.id}`)}
                    className="text-lg sm:text-xl font-semibold text-base-0D cursor-pointer hover:text-base-0D/80 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 rounded flex-1"
                    tabIndex={0}
                    role="link"
                    aria-label={`${t('board.open')}: ${board.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/boards/${board.id}`);
                      }
                    }}
                  >
                    <i className="fas fa-clipboard-list mr-2" aria-hidden="true"></i>
                    {board.name}
                  </h3>
                  {board.isPublic && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-base-0B/20 text-base-0B ml-2">
                      <i className="fas fa-globe mr-1" aria-hidden="true"></i>
                      {t('board.public')}
                    </span>
                  )}
                  {board.isTemplate && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-base-0E/20 text-base-0E ml-2">
                      <i className="fas fa-copy mr-1" aria-hidden="true"></i>
                      {t('board.template')}
                    </span>
                  )}
                </div>
                {board.description && (
                  <p className="text-base-04 text-sm sm:text-base mb-4 line-clamp-2">{board.description}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => navigate(`/boards/${board.id}`)}
                    className="flex-1 bg-base-0D text-base-07 px-4 py-2.5 sm:py-2 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors text-sm shadow-sm touch-target font-medium"
                    aria-label={`${t('board.open')}: ${board.name}`}
                  >
                    <i className="fas fa-door-open mr-2" aria-hidden="true"></i>
                    {t('board.open')}
                  </button>
                  {/* Only show Delete button for Admins */}
                  {isAdmin() && (
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="flex-1 bg-base-08 hover:bg-base-08/90 text-base-07 px-4 py-2.5 sm:py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-base-08 focus:ring-offset-2 transition-colors text-sm shadow-sm touch-target font-medium"
                      aria-label={`${t('common.delete')}: ${board.name}`}
                    >
                      <i className="fas fa-trash mr-2" aria-hidden="true"></i>
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BoardList;

