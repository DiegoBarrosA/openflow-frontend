import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { azureLogin } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      // Use AuthContext login which handles role
      login(response.data.token, response.data.username, response.data.role);
      navigate('/boards');
    } catch (err) {
      setError(t('auth.login.invalidCredentials'));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-0D via-base-0C to-base-0E container-responsive py-8">
      <div className="bg-base-07 dark:bg-base-01 p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md border border-base-02 dark:border-base-03">
        <div className="flex justify-end gap-2 mb-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <h1 className="text-responsive-xl font-bold text-center text-base-0D mb-2" aria-label="OpenFlow Application">
          <i className="fas fa-project-diagram mr-2" aria-hidden="true"></i>
          OpenFlow
        </h1>
        <h2 className="text-responsive-lg font-semibold text-center text-base-05 mb-6">{t('auth.login.title')}</h2>
        {error && (
          <div 
            role="alert" 
            aria-live="polite"
            className="bg-base-08/10 dark:bg-base-08/20 text-base-08 p-3 rounded-md mb-4 text-center border border-base-08/30 dark:border-base-08/50 text-sm sm:text-base"
          >
            <i className="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" aria-label={t('auth.login.title')}>
          <div>
            <label htmlFor="username" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
              <i className="fas fa-user mr-2" aria-hidden="true"></i>
              {t('auth.login.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
              required
              aria-required="true"
              aria-describedby={error ? "error-message" : undefined}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
              <i className="fas fa-lock mr-2" aria-hidden="true"></i>
              {t('auth.login.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
              required
              aria-required="true"
              aria-describedby={error ? "error-message" : undefined}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-base-0D text-base-07 py-3 sm:py-2.5 px-4 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md touch-target text-base sm:text-sm font-medium"
            aria-label={t('common.login')}
          >
            <i className="fas fa-sign-in-alt mr-2" aria-hidden="true"></i>
            {t('common.login')}
          </button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-base-03 dark:border-base-02"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-base-07 dark:bg-base-01 text-base-04">{t('common.or')}</span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={azureLogin}
          className="w-full bg-base-07 dark:bg-base-01 text-base-05 py-3 sm:py-2.5 px-4 rounded-md border-2 border-base-03 dark:border-base-02 hover:border-base-04 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md touch-target text-base sm:text-sm font-medium flex items-center justify-center gap-2"
          aria-label={t('auth.login.signInWithMicrosoft')}
        >
          <i className="fab fa-microsoft text-xl" aria-hidden="true"></i>
          {t('auth.login.signInWithMicrosoft')}
        </button>
        
        <p className="text-center mt-6 text-base-05 text-sm sm:text-base">
          {t('auth.login.dontHaveAccount')}{' '}
          <Link 
            to="/register" 
            className="text-base-0D hover:text-base-0D/80 font-medium underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 rounded"
            aria-label={t('auth.login.registerLink')}
          >
            {t('auth.login.registerLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;

