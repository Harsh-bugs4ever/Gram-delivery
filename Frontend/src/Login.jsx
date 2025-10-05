import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('entrepreneur');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`https://gram-delivery.onrender.com/api/auth/login`, {
        email,
        password,
        userType,
      });

      localStorage.setItem('accessToken', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      setUser(res.data.user);
      navigate(res.data.user.userType === 'entrepreneur' ? '/dashboard' : '/deliveries');
    } catch (err) {
      if (!err.response) setError('Server unreachable');
      else setError(err.response.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4">
      <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white border-opacity-20">
        <h2 className="text-4xl font-bold text-white text-center mb-6">Welcome Back</h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <select
            value={userType}
            onChange={e => setUserType(e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="entrepreneur" className="text-gray-900">Entrepreneur</option>
            <option value="delivery" className="text-gray-900">Delivery Partner</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p
          onClick={() => navigate('/register')}
          className="text-center text-gray-300 mt-6 cursor-pointer hover:text-white transition"
        >
          Don't have an account? <span className="font-bold text-emerald-400">Register</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
