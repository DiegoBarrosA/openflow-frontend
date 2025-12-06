import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import BoardList from './components/BoardList';
import Board from './components/Board';
import OAuthCallback from './components/OAuthCallback';
import PublicBoardList from './components/PublicBoardList';
import PublicBoard from './components/PublicBoard';

/**
 * Private route wrapper - requires authentication.
 * Redirects unauthenticated users to public boards.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated() ? children : <Navigate to="/public/boards" />;
};

/**
 * Admin-only route wrapper.
 * Redirects unauthenticated users to public boards.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/public/boards" />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/boards" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - no authentication required */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      
      {/* Public board viewing - no authentication required */}
      <Route path="/public/boards" element={<PublicBoardList />} />
      <Route path="/public/boards/:id" element={<PublicBoard />} />
      
      {/* Protected routes - authentication required */}
      <Route
        path="/boards"
        element={
          <PrivateRoute>
            <BoardList />
          </PrivateRoute>
        }
      />
      <Route
        path="/boards/:id"
        element={
          <PrivateRoute>
            <Board />
          </PrivateRoute>
        }
      />
      
      {/* Default redirect - go to public boards */}
      <Route path="/" element={<Navigate to="/public/boards" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

