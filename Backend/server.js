// server.js - Complete Backend Server with Enhanced Authentication
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Enhanced User Schema with additional auth fields
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['entrepreneur', 'delivery'], required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  refreshToken: { type: String },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for performance
userSchema.index({ email: 1, userType: 1 });

const User = mongoose.model('User', userSchema);

// Product/Shipment Schema
const productSchema = new mongoose.Schema({
  entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entrepreneurName: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: String, required: true },
  weight: { type: Number, required: true },
  cost: { type: Number, required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  currentLocation: { type: String },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryPartnerName: { type: String },
  deliveryPartnerPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', expired: true });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Helper function to generate tokens
const generateTokens = (userId, userType) => {
  const accessToken = jwt.sign(
    { userId, userType },
    JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId, userType, tokenType: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Long-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Helper function to generate random token
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ==================== AUTH ROUTES ====================

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength (min 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = generateRandomToken();

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      userType,
      emailVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id, newUser.userType);

    // Save refresh token to database
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // TODO: Send verification email
    console.log('Email Verification Token:', emailVerificationToken);
    console.log('Verification URL:', `http://localhost:3000/verify-email?token=${emailVerificationToken}`);

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        userType: newUser.userType,
        isEmailVerified: newUser.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate required fields
    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Email, password, and user type are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase(), userType });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        lockUntil: user.lockUntil
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        await user.save();
        return res.status(423).json({ 
          message: 'Account locked due to too many failed login attempts. Try again in 30 minutes.' 
        });
      }

      await user.save();
      return res.status(400).json({ 
        message: 'Invalid credentials',
        attemptsRemaining: 5 - user.loginAttempts
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.userType);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh Token
app.post('/api/auth/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }

      // Find user and verify refresh token matches
      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      // Generate new tokens
      const tokens = generateTokens(user._id, user.userType);

      // Update refresh token in database
      user.refreshToken = tokens.refreshToken;
      await user.save();

      res.json({
        message: 'Token refreshed successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify Email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resend Email Verification
app.post('/api/auth/resend-verification', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = generateRandomToken();
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // TODO: Send verification email
    console.log('New Verification Token:', emailVerificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email || !userType) {
      return res.status(400).json({ message: 'Email and user type are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), userType });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.json({ message: 'If an account exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // TODO: Send password reset email
    console.log('Password Reset Token:', resetToken);
    console.log('Reset URL:', `http://localhost:3000/reset-password?token=${resetToken}`);

    res.json({ message: 'If an account exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change Password (for logged-in users)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken -emailVerificationToken -passwordResetToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      user.phone = phone;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== PRODUCT ROUTES (ENTREPRENEUR) ====================

// Create Product/Shipment
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'entrepreneur') {
      return res.status(403).json({ message: 'Only entrepreneurs can create products' });
    }

    const user = await User.findById(req.user.userId);
    const { productName, quantity, weight, cost, fromLocation, toLocation } = req.body;

    // Validation
    if (!productName || !quantity || !weight || !cost || !fromLocation || !toLocation) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newProduct = new Product({
      entrepreneurId: req.user.userId,
      entrepreneurName: user.name,
      productName,
      quantity,
      weight,
      cost,
      fromLocation,
      toLocation,
      currentLocation: fromLocation
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Entrepreneur's Products
app.get('/api/products/my-products', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'entrepreneur') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const products = await Product.find({ entrepreneurId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Product Status and Location
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { status, currentLocation } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check authorization
    if (req.user.userType === 'entrepreneur' && 
        product.entrepreneurId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (status) product.status = status;
    if (currentLocation) product.currentLocation = currentLocation;
    product.updatedAt = Date.now();

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.entrepreneurId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow deletion if delivery partner is assigned
    if (product.deliveryPartnerId) {
      return res.status(400).json({ 
        message: 'Cannot delete product with assigned delivery partner' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== DELIVERY ROUTES (DELIVERY PARTNER) ====================

// Get Available Deliveries (for delivery partners)
app.get('/api/deliveries/available', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'delivery') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const products = await Product.find({ 
      status: 'Pending',
      deliveryPartnerId: null
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get available deliveries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept Delivery
app.post('/api/deliveries/accept/:productId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'delivery') {
      return res.status(403).json({ message: 'Only delivery partners can accept deliveries' });
    }

    const { offeredPrice } = req.body;

    if (!offeredPrice || offeredPrice <= 0) {
      return res.status(400).json({ message: 'Valid offered price is required' });
    }

    const user = await User.findById(req.user.userId);
    
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'Pending') {
      return res.status(400).json({ message: 'Product is no longer available' });
    }

    if (product.deliveryPartnerId) {
      return res.status(400).json({ message: 'Delivery already accepted by another partner' });
    }

    product.deliveryPartnerId = req.user.userId;
    product.deliveryPartnerName = user.name;
    product.deliveryPartnerPrice = offeredPrice;
    product.status = 'Accepted';
    product.updatedAt = Date.now();

    await product.save();

    res.json({
      message: 'Delivery accepted successfully',
      product
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Delivery Partner's Accepted Deliveries
app.get('/api/deliveries/my-deliveries', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'delivery') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deliveries = await Product.find({ 
      deliveryPartnerId: req.user.userId 
    }).sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    console.error('Get my deliveries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Delivery Status
app.put('/api/deliveries/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, currentLocation } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.deliveryPartnerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validStatuses = ['Accepted', 'In Transit', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status) product.status = status;
    if (currentLocation) product.currentLocation = currentLocation;
    product.updatedAt = Date.now();

    await product.save();

    res.json({
      message: 'Delivery status updated successfully',
      product
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== GENERAL ROUTES ====================

// Get Product by ID
app.get('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has access to this product
    const hasAccess = 
      product.entrepreneurId.toString() === req.user.userId ||
      (product.deliveryPartnerId && product.deliveryPartnerId.toString() === req.user.userId);

    if (!hasAccess && req.user.userType !== 'delivery') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Statistics (for dashboard)
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    let stats = {};

    if (req.user.userType === 'entrepreneur') {
      const totalProducts = await Product.countDocuments({ entrepreneurId: req.user.userId });
      const pending = await Product.countDocuments({ entrepreneurId: req.user.userId, status: 'Pending' });
      const inTransit = await Product.countDocuments({ entrepreneurId: req.user.userId, status: 'In Transit' });
      const delivered = await Product.countDocuments({ entrepreneurId: req.user.userId, status: 'Delivered' });

      stats = {
        totalProducts,
        pending,
        inTransit,
        delivered
      };
    } else if (req.user.userType === 'delivery') {
      const totalDeliveries = await Product.countDocuments({ deliveryPartnerId: req.user.userId });
      const inTransit = await Product.countDocuments({ deliveryPartnerId: req.user.userId, status: 'In Transit' });
      const delivered = await Product.countDocuments({ deliveryPartnerId: req.user.userId, status: 'Delivered' });
      const available = await Product.countDocuments({ status: 'Pending', deliveryPartnerId: null });

      stats = {
        totalDeliveries,
        inTransit,
        delivered,
        available
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Logistics Platform API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        refreshToken: 'POST /api/auth/refresh-token',
        verifyEmail: 'POST /api/auth/verify-email',
        resendVerification: 'POST /api/auth/resend-verification',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        changePassword: 'POST /api/auth/change-password'
      },
      products: {
        create: 'POST /api/products',
        myProducts: 'GET /api/products/my-products',
        getById: 'GET /api/products/:id',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      deliveries: {
        available: 'GET /api/deliveries/available',
        accept: 'POST /api/deliveries/accept/:productId',
        myDeliveries: 'GET /api/deliveries/my-deliveries',
        updateStatus: 'PUT /api/deliveries/:id/status'
      },
      general: {
        stats: 'GET /api/stats',
        health: 'GET /api/health'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ 
      message: 'Duplicate entry', 
      field: Object.keys(err.keyPattern)[0] 
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Default error
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log('=================================');
});

module.exports = app;