import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#82AAFF] via-[#88D8C0] to-[#B19CD9] container-responsive py-8">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h1 className="text-responsive-xl font-bold text-center text-[#82AAFF] mb-2" aria-label="OpenFlow Application">
          OpenFlow
        </h1>
        <h2 className="text-responsive-lg font-semibold text-center text-gray-700 mb-6">Register</h2>
        {error && (
          <div 
            role="alert" 
            aria-live="polite"
            className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-center border border-red-200 text-sm sm:text-base"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Registration form">
          <div>
            <label htmlFor="reg-username" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
              required
              aria-required="true"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm sm:text-base font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:border-transparent text-base touch-target"
              required
              aria-required="true"
              minLength="6"
              aria-describedby="password-help"
              autoComplete="new-password"
            />
            <p id="password-help" className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          <button
            type="submit"
            className="w-full bg-[#82AAFF] text-white py-3 sm:py-2.5 px-4 rounded-md hover:bg-[#6B8FE8] focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 transition-colors shadow-md touch-target text-base sm:text-sm font-medium"
            aria-label="Submit registration form"
          >
            Register
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600 text-sm sm:text-base">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-[#82AAFF] hover:text-[#6B8FE8] font-medium underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[#82AAFF] focus:ring-offset-2 rounded"
            aria-label="Navigate to login page"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;

