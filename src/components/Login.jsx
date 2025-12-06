import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { azureLogin } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      // Use AuthContext login which handles role
      login(response.data.token, response.data.username, response.data.role);
      navigate('/boards');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#82AAFF] via-[#88D8C0] to-[#B19CD9] container-responsive py-8">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h1 className="text-responsive-xl font-bold text-center text-[#82AAFF] mb-2" aria-label="OpenFlow Application">
          OpenFlow
        </h1>
        <h2 className="text-responsive-lg font-semibold text-center text-gray-700 mb-6">Login</h2>
        {error && (
          <div 
            role="alert" 
            aria-live="polite"
            className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-center border border-red-200 text-sm sm:text-base"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
          <div>
            <label htmlFor="username" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
              required
              aria-required="true"
              aria-describedby={error ? "error-message" : undefined}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
              required
              aria-required="true"
              aria-describedby={error ? "error-message" : undefined}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#82AAFF] text-white py-3 sm:py-2.5 px-4 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md touch-target text-base sm:text-sm font-medium"
            aria-label="Submit login form"
          >
            Login
          </button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={azureLogin}
          className="w-full bg-white text-gray-700 py-3 sm:py-2.5 px-4 rounded-md border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md touch-target text-base sm:text-sm font-medium flex items-center justify-center gap-2"
          aria-label="Sign in with Microsoft"
        >
          <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H10.7778V10.7778H0V0Z" fill="#F25022"/>
            <path d="M12.2222 0H23V10.7778H12.2222V0Z" fill="#7FBA00"/>
            <path d="M0 12.2222H10.7778V23H0V12.2222Z" fill="#00A4EF"/>
            <path d="M12.2222 12.2222H23V23H12.2222V12.2222Z" fill="#FFB900"/>
          </svg>
          Sign in with Microsoft
        </button>
        
        <p className="text-center mt-6 text-gray-600 text-sm sm:text-base">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-[#82AAFF] hover:text-[#6B8FE8] font-medium underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 rounded"
            aria-label="Navigate to registration page"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;

