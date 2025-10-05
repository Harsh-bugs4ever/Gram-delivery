import React, { useState } from 'react';
import axios from 'axios';

const ProfilePage = ({ user, setUser }) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, { name, phone }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      {message && <p>{message}</p>}
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" />
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
};

export default ProfilePage;
