import React, { useState } from 'react';
import { Truck, Package, MapPin, User, LogOut, Menu, Globe } from 'lucide-react';

const GramDeliveryApp = () => {
  const [page, setPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [lang, setLang] = useState('en');

  const t = {
    en: { home: 'Home', about: 'About', login: 'Login', signup: 'Sign Up', logout: 'Logout' },
    mr: { home: 'मुख्यपृष्ठ', about: 'आमच्याबद्दल', login: 'लॉगिन', signup: 'नोंदणी', logout: 'लॉगआउट' }
  }[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setPage('home')}>
            <div className="bg-white p-2 rounded-lg">
              <Truck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gram Delivery</h1>
              <p className="text-xs">ग्राम डिलिव्हरी</p>
            </div>
          </div>
          
          <nav className="flex space-x-6 items-center">
            <button onClick={() => setPage('home')} className="hover:text-emerald-200 font-semibold">{t.home}</button>
            <button onClick={() => setPage('about')} className="hover:text-emerald-200 font-semibold">{t.about}</button>
            {!isLoggedIn ? (
              <>
                <button onClick={() => setPage('login')} className="hover:text-emerald-200 font-semibold">{t.login}</button>
                <button onClick={() => setPage('signup')} className="bg-white text-emerald-600 px-6 py-2 rounded-full font-bold">{t.signup}</button>
              </>
            ) : (
              <>
                <button onClick={() => setPage('dashboard')} className="hover:text-emerald-200 font-semibold">Dashboard</button>
                <button onClick={() => { setIsLoggedIn(false); setPage('home'); }} className="hover:text-emerald-200 font-semibold">{t.logout}</button>
              </>
            )}
            <button onClick={() => setLang(lang === 'en' ? 'mr' : 'en')} className="flex items-center space-x-1 bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
            </button>
          </nav>
        </div>
      </header>

      {page === 'home' && (
        <div className="min-h-screen">
          <div className="h-screen bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center text-white">
            <div className="text-center px-4">
              <div className="text-9xl mb-6">🚜</div>
              <h1 className="text-6xl font-bold mb-4">Welcome to Gram Delivery</h1>
              <p className="text-2xl mb-2">ग्राम डिलिव्हरी मध्ये आपले स्वागत आहे</p>
              <p className="text-xl mb-8">Connecting Rural Entrepreneurs with Local Transporters</p>
              <button onClick={() => setPage('signup')} className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100">
                Get Started Now
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
            <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div><div className="text-5xl font-bold">5000+</div><div className="text-lg">Active Users</div></div>
              <div><div className="text-5xl font-bold">12000+</div><div className="text-lg">Deliveries</div></div>
              <div><div className="text-5xl font-bold">150+</div><div className="text-lg">Cities</div></div>
              <div><div className="text-5xl font-bold">98%</div><div className="text-lg">Success Rate</div></div>
            </div>
          </div>

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
      )}

      {page === 'about' && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-12 rounded-3xl border border-white border-opacity-20">
              <h1 className="text-5xl font-bold text-white mb-6">About Gram Delivery</h1>
              <p className="text-xl text-gray-200 mb-8">
                Gram Delivery bridges the gap between rural entrepreneurs and local transporters, 
                enabling seamless product transportation across villages and cities.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                  <p className="text-white">Empower rural entrepreneurs with reliable logistics</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                  <p className="text-white">Connect every village to market opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 'login' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl w-full max-w-md border border-white border-opacity-20">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-emerald-400 to-blue-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Welcome Back!</h2>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
              <select className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white">
                <option value="entrepreneur" className="text-gray-900">Entrepreneur</option>
                <option value="delivery" className="text-gray-900">Delivery Partner</option>
              </select>
              <button onClick={() => { setIsLoggedIn(true); setUserType('entrepreneur'); setPage('dashboard'); }} 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold">
                Login
              </button>
            </div>
            <p className="text-center text-gray-300 mt-6">
              Don't have an account? <button onClick={() => setPage('signup')} className="text-emerald-400 font-bold">Sign Up</button>
            </p>
          </div>
        </div>
      )}

      {page === 'signup' && (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl w-full max-w-md border border-white border-opacity-20">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Join Us!</h2>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
              <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
              <input type="tel" placeholder="Phone" className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
              <select className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white">
                <option value="entrepreneur" className="text-gray-900">Entrepreneur</option>
                <option value="delivery" className="text-gray-900">Delivery Partner</option>
              </select>
              <button onClick={() => { setIsLoggedIn(true); setUserType('entrepreneur'); setPage('dashboard'); }} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {page === 'dashboard' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
            
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-8 rounded-3xl shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Add New Product</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Product Name" className="px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
                <input type="text" placeholder="Quantity" className="px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
                <input type="number" placeholder="Weight (kg)" className="px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
                <input type="number" placeholder="Cost (₹)" className="px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
                <input type="text" placeholder="From" className="px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
                <input type="text" placeholder="To" className="px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300" />
              </div>
              <button className="mt-4 bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100">
                Add Product
              </button>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6">Active Shipments</h2>
              <div className="space-y-4">
                <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Organic Vegetables</h3>
                      <p className="text-gray-300">Quantity: 50 kg</p>
                      <p className="text-gray-300">Cost: ₹500</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500 text-white">In Transit</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Location: Mumbai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GramDeliveryApp;