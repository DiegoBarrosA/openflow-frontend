import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
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

