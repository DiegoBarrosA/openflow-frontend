import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';

function OAuthCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useTranslation();

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
              setError(t('auth.oauth.tokenNotReceived'));
            }
          } else {
            setError(t('auth.oauth.failed'));
          }
        } catch (err) {
          // If /auth/me fails, try /auth/azure/success directly
          try {
            const authResponse = await api.get('/auth/azure/success');
            if (authResponse.data && authResponse.data.token) {
              login(authResponse.data.token, authResponse.data.username, authResponse.data.role);
              navigate('/boards');
            } else {
              setError(t('auth.oauth.failed'));
            }
          } catch (authErr) {
            setError(t('auth.oauth.pleaseTryAgain'));
            setTimeout(() => navigate('/public/boards'), 3000);
          }
        }
      } catch (err) {
        setError(t('auth.oauth.errorOccurred'));
        setTimeout(() => navigate('/public/boards'), 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-0D via-base-0D to-base-0E container-responsive py-8">
      <div className="bg-base-07 dark:bg-base-01 p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md border border-base-02 dark:border-base-03 text-center">
        {error ? (
          <>
            <h2 className="text-responsive-lg font-semibold text-base-05 mb-4">
              <i className="fas fa-exclamation-triangle mr-2 text-base-08" aria-hidden="true"></i>
              {t('auth.oauth.error')}
            </h2>
            <p className="text-base-08 mb-4">{error}</p>
            <p className="text-base-04 text-sm">{t('auth.oauth.redirecting')}</p>
          </>
        ) : (
          <>
            <h2 className="text-responsive-lg font-semibold text-base-05 mb-4">
              <i className="fas fa-sign-in-alt mr-2" aria-hidden="true"></i>
              {t('auth.oauth.completing')}
            </h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-base-0D mx-auto"></div>
            <p className="text-base-04 mt-4">{t('common.loading')}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default OAuthCallback;

