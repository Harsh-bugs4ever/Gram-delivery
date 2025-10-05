// Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, MapPin, User, Globe } from 'lucide-react';

const HomePage = () => {
  const [lang, setLang] = useState('en');
  const navigate = useNavigate();

  const t = {
    en: { home: 'Home', about: 'About', login: 'Login', signup: 'Sign Up', logout: 'Logout' },
    mr: { home: 'मुख्यपृष्ठ', about: 'आमच्याबद्दल', login: 'लॉगिन', signup: 'नोंदणी', logout: 'लॉगआउट' }
  }[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Navbar */}
      <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-white p-2 rounded-lg">
              <Truck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gram Delivery</h1>
              <p className="text-xs">ग्राम डिलिव्हरी</p>
            </div>
          </div>

          <nav className="flex space-x-6 items-center">
            <button onClick={() => navigate('/')} className="hover:text-emerald-200 font-semibold">{t.home}</button>
            <button onClick={() => navigate('/about')} className="hover:text-emerald-200 font-semibold">{t.about}</button>
            <button onClick={() => navigate('/login')} className="hover:text-emerald-200 font-semibold">{t.login}</button>
            <button onClick={() => navigate('/register')} className="bg-white text-emerald-600 px-6 py-2 rounded-full font-bold">{t.signup}</button>
            <button onClick={() => setLang(lang === 'en' ? 'mr' : 'en')} className="flex items-center space-x-1 bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="h-screen bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center text-white">
        <div className="text-center px-4">
          <div className="text-9xl mb-6">🚜</div>
          <h1 className="text-6xl font-bold mb-4">Welcome to Gram Delivery</h1>
          <p className="text-2xl mb-2">ग्राम डिलिव्हरी मध्ये आपले स्वागत आहे</p>
          <p className="text-xl mb-8">Connecting Rural Entrepreneurs with Local Transporters</p>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100">
            Get Started Now
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          <div><div className="text-5xl font-bold">5000+</div><div className="text-lg">Active Users</div></div>
          <div><div className="text-5xl font-bold">12000+</div><div className="text-lg">Deliveries</div></div>
          <div><div className="text-5xl font-bold">150+</div><div className="text-lg">Cities</div></div>
          <div><div className="text-5xl font-bold">98%</div><div className="text-lg">Success Rate</div></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-slate-900 to-purple-900">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-white mb-16">Why Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-emerald-600" />
              </div>
              <h4 className="font-bold text-xl text-white mb-3">Easy Listing</h4>
              <p className="text-emerald-50">List products quickly</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="font-bold text-xl text-white mb-3">Real-time Tracking</h4>
              <p className="text-blue-50">Monitor shipments</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-2xl text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">₹</span>
              </div>
              <h4 className="font-bold text-xl text-white mb-3">Affordable</h4>
              <p className="text-purple-50">Fair pricing</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-2xl text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-orange-600" />
              </div>
              <h4 className="font-bold text-xl text-white mb-3">Trusted</h4>
              <p className="text-orange-50">Verified partners</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
