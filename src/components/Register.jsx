import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      // Use AuthContext login which handles role
      login(response.data.token, response.data.username, response.data.role);
      navigate('/boards');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.register.registrationFailed'));
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
        <h2 className="text-responsive-lg font-semibold text-center text-base-05 mb-6">{t('auth.register.title')}</h2>
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
        <form onSubmit={handleSubmit} className="space-y-4" aria-label={t('auth.register.title')}>
          <div>
            <label htmlFor="reg-username" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
              <i className="fas fa-user mr-2" aria-hidden="true"></i>
              {t('auth.register.username')}
            </label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
              required
              aria-required="true"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
              <i className="fas fa-envelope mr-2" aria-hidden="true"></i>
              {t('auth.register.email')}
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm sm:text-base font-medium text-base-05 mb-1">
              <i className="fas fa-lock mr-2" aria-hidden="true"></i>
              {t('auth.register.password')}
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-base-03 dark:border-base-02 rounded-md focus:outline-none focus:ring-2 focus:ring-base-0D focus:border-transparent text-base touch-target bg-base-07 dark:bg-base-00 text-base-05"
              required
              aria-required="true"
              minLength="6"
              aria-describedby="password-help"
              autoComplete="new-password"
            />
            <p id="password-help" className="text-xs text-base-04 mt-1">{t('auth.register.passwordMinLength')}</p>
          </div>
          <button
            type="submit"
            className="w-full bg-base-0D text-base-07 py-3 sm:py-2.5 px-4 rounded-md hover:bg-base-0D/90 focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 transition-colors shadow-md touch-target text-base sm:text-sm font-medium"
            aria-label={t('auth.register.registerButton')}
          >
            <i className="fas fa-user-plus mr-2" aria-hidden="true"></i>
            {t('auth.register.registerButton')}
          </button>
        </form>
        <p className="text-center mt-6 text-base-05 text-sm sm:text-base">
          {t('auth.register.alreadyHaveAccount')}{' '}
          <Link 
            to="/login" 
            className="text-base-0D hover:text-base-0D/80 font-medium underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-base-0D focus:ring-offset-2 rounded"
            aria-label={t('auth.register.loginLink')}
          >
            {t('auth.register.loginLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;

