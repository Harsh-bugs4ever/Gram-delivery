import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('entrepreneur');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
        userType,
      });

      localStorage.setItem('accessToken', res.data.accessToken);
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select value={userType} onChange={e => setUserType(e.target.value)}>
          <option value="entrepreneur">Entrepreneur</option>
          <option value="delivery">Delivery Partner</option>
        </select>
        <button type="submit">Login</button>
      </form>
      <p onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
        Don't have an account? Register
      </p>
    </div>
  );
};

export default LoginPage;
