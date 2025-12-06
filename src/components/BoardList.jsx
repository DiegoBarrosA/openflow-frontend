import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth, ROLES } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

function BoardList() {
  const [boards, setBoards] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardIsPublic, setNewBoardIsPublic] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { isAdmin, getUsername, getRole, logout } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, []);

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

  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data);
    } catch (err) {
      console.error('Error fetching boards:', err);
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
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board?')) {
      return;
    }
    try {
      await api.delete(`/boards/${id}`);
      setBoards(boards.filter((board) => board.id !== id));
    } catch (err) {
      console.error('Error deleting board:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const username = getUsername();
  const role = getRole();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-[#F5F5F5] text-gray-700 container-responsive py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#82AAFF]">OpenFlow</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/public/boards"
              className="text-gray-500 hover:text-[#82AAFF] text-sm font-medium"
            >
              Public Boards
            </Link>
            
            {/* Notifications */}
            <NotificationBell />
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors touch-target"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#88D8C0] flex items-center justify-center text-gray-800 font-semibold text-sm sm:text-base">
                  {username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-gray-700 text-sm sm:text-base font-medium hidden sm:block">
                  {username}
                </span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#88D8C0] flex items-center justify-center text-gray-800 font-semibold">
                        {username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{username}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          role === ROLES.ADMIN 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {role === ROLES.ADMIN ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Logout from application"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto container-responsive py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-700">My Boards</h2>
          {/* Only show Create Board button for Admins */}
          {isAdmin() && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-[#82AAFF] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md touch-target w-full sm:w-auto text-sm sm:text-base font-medium"
              aria-label={showCreateForm ? 'Cancel board creation' : 'Create new board'}
              aria-expanded={showCreateForm}
            >
              {showCreateForm ? 'Cancel' : 'Create Board'}
            </button>
          )}
        </div>

        {/* Only show create form for Admins */}
        {isAdmin() && showCreateForm && (
          <form 
            onSubmit={handleCreateBoard} 
            className="bg-white p-5 sm:p-6 rounded-lg shadow-sm mb-6 border border-gray-200"
            aria-label="Create board form"
          >
            <div className="mb-4">
              <label htmlFor="board-name" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                Board Name
              </label>
              <input
                id="board-name"
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
                required
                aria-required="true"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="board-description" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
                Description
              </label>
              <textarea
                id="board-description"
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent min-h-[80px] resize-y text-base"
                aria-label="Board description"
              />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                id="board-public"
                type="checkbox"
                checked={newBoardIsPublic}
                onChange={(e) => setNewBoardIsPublic(e.target.checked)}
                className="w-4 h-4 text-[#82AAFF] border-gray-300 rounded focus:ring-[#82AAFF]"
              />
              <label htmlFor="board-public" className="text-sm sm:text-base font-medium text-gray-600">
                Make this board public (visible to everyone)
              </label>
            </div>
            <button
              type="submit"
              className="bg-[#82AAFF] text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md touch-target text-sm sm:text-base font-medium"
              aria-label="Submit board creation"
            >
              Create
            </button>
          </form>
        )}

        {boards.length === 0 ? (
          <div className="text-center py-12 sm:py-20 text-gray-600" role="status" aria-live="polite">
            <p className="text-base sm:text-lg">
              {isAdmin() 
                ? "No boards yet. Create one to get started!" 
                : "No boards available. Ask an administrator to create one."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" role="list" aria-label="List of boards">
            {boards.map((board) => (
              <article
                key={board.id}
                className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-[#88D8C0]"
                role="listitem"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3
                    onClick={() => navigate(`/boards/${board.id}`)}
                    className="text-lg sm:text-xl font-semibold text-[#82AAFF] cursor-pointer hover:text-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 rounded flex-1"
                    tabIndex={0}
                    role="link"
                    aria-label={`Open board: ${board.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/boards/${board.id}`);
                      }
                    }}
                  >
                    {board.name}
                  </h3>
                  {board.isPublic && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                      Public
                    </span>
                  )}
                </div>
                {board.description && (
                  <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">{board.description}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => navigate(`/boards/${board.id}`)}
                    className="flex-1 bg-[#82AAFF] text-white px-4 py-2.5 sm:py-2 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors text-sm shadow-sm touch-target font-medium"
                    aria-label={`Open board: ${board.name}`}
                  >
                    Open
                  </button>
                  {/* Only show Delete button for Admins */}
                  {isAdmin() && (
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2.5 sm:py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors text-sm shadow-sm touch-target font-medium"
                      aria-label={`Delete board: ${board.name}`}
                    >
                      Delete
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

