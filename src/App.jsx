import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import BoardList from './components/BoardList';
import Board from './components/Board';
import OAuthCallback from './components/OAuthCallback';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
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
          <Route path="/" element={<Navigate to="/boards" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

