import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function OAuthCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a token in the URL (from backend redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const username = urlParams.get('username');
        const role = urlParams.get('role');

        if (token && username) {
          // Use AuthContext login which handles role extraction
          login(token, username, role);
          navigate('/boards');
          return;
        }

        // If no token in URL, try to get current user info (user might be authenticated via session)
        try {
          const response = await api.get('/auth/me');
          if (response.data && response.data.username) {
            // User is authenticated, but we need a token
            // Try to get token from Azure AD success endpoint
            const authResponse = await api.get('/auth/azure/success');
            if (authResponse.data && authResponse.data.token) {
              login(authResponse.data.token, authResponse.data.username, authResponse.data.role);
              navigate('/boards');
            } else {
              setError('Authentication successful but token not received');
            }
          } else {
            setError('Authentication failed');
          }
        } catch (err) {
          // If /auth/me fails, try /auth/azure/success directly
          try {
            const authResponse = await api.get('/auth/azure/success');
            if (authResponse.data && authResponse.data.token) {
              login(authResponse.data.token, authResponse.data.username, authResponse.data.role);
              navigate('/boards');
            } else {
              setError('Authentication failed');
            }
          } catch (authErr) {
            setError('Authentication failed. Please try logging in again.');
            setTimeout(() => navigate('/login'), 3000);
          }
        }
      } catch (err) {
        setError('An error occurred during authentication');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#82AAFF] via-[#88D8C0] to-[#B19CD9] container-responsive py-8">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md border border-gray-200 text-center">
        {error ? (
          <>
            <h2 className="text-responsive-lg font-semibold text-gray-700 mb-4">Authentication Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600 text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <h2 className="text-responsive-lg font-semibold text-gray-700 mb-4">Completing Sign In</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#82AAFF] mx-auto"></div>
            <p className="text-gray-600 mt-4">Please wait...</p>
          </>
        )}
      </div>
    </main>
  );
}

export default OAuthCallback;

