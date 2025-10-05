import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

const RegisterPage = ({ setUser }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'entrepreneur'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/register`, form);
      localStorage.setItem('accessToken', res.data.accessToken);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg p-10 rounded-3xl w-full max-w-md border border-white border-opacity-20 shadow-lg">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Join Us!</h2>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <select
            name="userType"
            value={form.userType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="entrepreneur" className="text-gray-900">Entrepreneur</option>
            <option value="delivery" className="text-gray-900">Delivery Partner</option>
          </select>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-purple-400 font-bold">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
