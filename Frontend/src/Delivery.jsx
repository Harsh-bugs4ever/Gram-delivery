import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DeliveriesPage = ({ user }) => {
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);

  const fetchAvailable = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/deliveries/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailable(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyDeliveries = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/deliveries/my-deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyDeliveries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAvailable();
    fetchMyDeliveries();
  }, []);

  const handleAccept = async (id) => {
    const price = prompt('Enter your offered price:');
    if (!price) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/deliveries/accept/${id}`, { offeredPrice: price }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAvailable();
      fetchMyDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Available Deliveries</h2>
      <ul>
        {available.map(d => (
          <li key={d._id}>
            {d.productName} - {d.quantity} - From: {d.fromLocation} To: {d.toLocation}
            <button onClick={() => handleAccept(d._id)}>Accept</button>
          </li>
        ))}
      </ul>

      <h2>My Deliveries</h2>
      <ul>
        {myDeliveries.map(d => (
          <li key={d._id}>
            {d.productName} - Status: {d.status} - From: {d.fromLocation} To: {d.toLocation}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeliveriesPage;
