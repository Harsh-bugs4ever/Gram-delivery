// server.js - Main Backend Server File
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['entrepreneur', 'delivery'], required: true },
  createdAt: { type: Date, default: Date.now }
});

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

// Delivery Request Schema
const deliveryRequestSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const DeliveryRequest = mongoose.model('DeliveryRequest', deliveryRequestSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      userType
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Find user
    const user = await User.findOne({ email, userType });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
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

    if (status) product.status = status;
    if (currentLocation) product.currentLocation = currentLocation;
    product.updatedAt = Date.now();

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
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

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
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
    const user = await User.findById(req.user.userId);
    
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'Pending') {
      return res.status(400).json({ message: 'Product is no longer available' });
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

    if (status) product.status = status;
    if (currentLocation) product.currentLocation = currentLocation;
    product.updatedAt = Date.now();

    await product.save();

    res.json({
      message: 'Delivery status updated successfully',
      product
    });
  } catch (error) {
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
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;