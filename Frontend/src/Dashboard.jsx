import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Package } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [recentItems, setRecentItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const statsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);

        const itemsRes = await axios.get(`https://gram-delivery.onrender.com/api/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentItems(itemsRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen text-white">
      Loading...
    </div>
  );

  const entrepreneurStats = [
    { title: 'Total Products', value: stats?.totalProducts || 0, color: 'from-emerald-500 to-teal-600' },
    { title: 'Pending', value: stats?.pending || 0, color: 'from-yellow-500 to-orange-500' },
    { title: 'In Transit', value: stats?.inTransit || 0, color: 'from-blue-500 to-indigo-600' },
    { title: 'Delivered', value: stats?.delivered || 0, color: 'from-purple-500 to-pink-500' },
  ];

  const deliveryStats = [
    { title: 'Total Deliveries', value: stats?.totalDeliveries || 0, color: 'from-emerald-500 to-teal-600' },
    { title: 'In Transit', value: stats?.inTransit || 0, color: 'from-blue-500 to-indigo-600' },
    { title: 'Delivered', value: stats?.delivered || 0, color: 'from-purple-500 to-pink-500' },
    { title: 'Available', value: stats?.available || 0, color: 'from-green-500 to-lime-500' },
  ];

  const statsToRender = user.userType === 'entrepreneur' ? entrepreneurStats : deliveryStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 py-8">
      {/* Hero */}
      <div className="container mx-auto px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome, {user.name}!</h1>
        <p className="text-xl text-gray-300">
          {user.userType === 'entrepreneur' 
            ? 'Manage your products and track your shipments.' 
            : 'View your deliveries and stay updated in real-time.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {statsToRender.map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl text-white shadow-lg`}>
            <h3 className="text-xl font-bold mb-2">{stat.title}</h3>
            <p className="text-3xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 flex flex-wrap gap-6 mb-12">
        <button 
          onClick={() => navigate('/profile')} 
          className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-100"
        >
          Profile
        </button>

        {user.userType === 'entrepreneur' && (
          <>
            <button 
              onClick={() => navigate('/products')} 
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-100"
            >
              My Products
            </button>
            <button 
              onClick={() => navigate('/deliveries')} 
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-100"
            >
              My Deliveries
            </button>
          </>
        )}
      </div>

      {/* Recent Items */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-6">Recent {user.userType === 'entrepreneur' ? 'Products' : 'Deliveries'}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {recentItems.length === 0 ? (
            <p className="text-gray-300 col-span-full">No recent items.</p>
          ) : (
            recentItems.map((item, idx) => (
              <div key={idx} className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20 text-white">
                <h3 className="font-bold text-xl mb-2">{item.name || item.title}</h3>
                <p>{item.description || `Quantity: ${item.quantity}`}</p>
                {item.location && (
                  <div className="flex items-center mt-2 text-gray-300">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
