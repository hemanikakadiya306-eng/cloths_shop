const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    // TEMPORARILY BYPASS FOR DEBUGGING
    return next();
    
    // Check for session first
    if (req.session && req.session.userId) {
      return next();
    }
    
    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // TEMPORARY BYPASS FOR DEVELOPMENT
    return res.json({
      message: 'Login successful (Bypassed for Development)',
      token: 'admin-debug-token-active',
      admin: {
        id: 'debug-admin-id',
        name: 'Debug Admin',
        email: email || 'admin@clothshop.com'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Dashboard Statistics
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

    // Calculate Total Revenue
    const revenueAggregation = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled', 'Pending'] } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    // Top products
    const topProducts = await Product.find()
      .sort({ rating: -1 })
      .limit(5)
      .select('name images rating numReviews');

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      totalRevenue,
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Image Upload Route
router.post('/upload', isAdmin, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: imageUrls
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images'
    });
  }
});

// Products Management
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products }); // Standardize response
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

router.post('/products', isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    // Parse numeric fields
    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.discount) productData.discount = parseFloat(productData.discount) || 0;
    if (productData.stock) productData.stock = parseInt(productData.stock);
    
    productData.trending = productData.trending === true || productData.trending === 'true';
    productData.newArrival = productData.newArrival === true || productData.newArrival === 'true';

    // Ensure colors and sizes are arrays
    if (typeof productData.colors === 'string') productData.colors = productData.colors.split(',').map(c => c.trim());
    if (typeof productData.sizes === 'string') productData.sizes = productData.sizes.split(',').map(s => s.trim());

    const product = new Product(productData);
    await product.save();

    // Emit real-time sync event
    req.app.get('io').emit('product-added', product);

    res.json({ 
      message: 'Product created successfully',
      product 
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

router.put('/products/:id', isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Handle images - AddProduct sends the full list in req.body.images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      // If images were already in body, append new ones, otherwise set new ones
      const existingImages = productData.images ? (Array.isArray(productData.images) ? productData.images : [productData.images]) : [];
      productData.images = [...existingImages, ...newImages];
    }

    // Parse numeric fields
    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.discount) productData.discount = parseFloat(productData.discount) || 0;
    if (productData.stock) productData.stock = parseInt(productData.stock);

    productData.trending = productData.trending === true || productData.trending === 'true';
    productData.newArrival = productData.newArrival === true || productData.newArrival === 'true';

    // Ensure colors and sizes are arrays
    if (typeof productData.colors === 'string') productData.colors = productData.colors.split(',').map(c => c.trim());
    if (typeof productData.sizes === 'string') productData.sizes = productData.sizes.split(',').map(s => s.trim());

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time sync event
    req.app.get('io').emit('product-updated', product);

    res.json({ 
      message: 'Product updated successfully',
      product 
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time sync event
    req.app.get('io').emit('product-deleted', product);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Orders Management
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    res.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.put('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit real-time sync event
    req.app.get('io').emit('order-status-updated', order);

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Users Management
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name email phone createdAt lastLogin')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Categories Management
router.get('/categories', isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

router.post('/categories', isAdmin, async (req, res) => {
  try {
    const categoryData = { ...req.body };
    categoryData.slug = categoryData.name.toLowerCase().replace(/\s+/g, '-');
    categoryData.productCount = 0;

    const category = new Category(categoryData);
    await category.save();

    // Emit real-time sync event
    req.app.get('io').emit('category-added', category);

    res.json({ 
      message: 'Category created successfully',
      category 
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Reviews Management
router.get('/reviews', isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('productId', 'name images');

    res.json(reviews);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.put('/reviews/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // If approved, you might want to update product rating here
    if (status === 'Approved') {
      const productId = review.productId;
      const reviews = await Review.find({ productId, status: 'Approved' });
      const numReviews = reviews.length;
      const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;
      
      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        numReviews: numReviews
      });
    }

    res.json({ message: 'Review status updated' });
  } catch (error) {
    console.error('Review status update error:', error);
    res.status(500).json({ message: 'Error updating review status' });
  }
});

router.delete('/reviews/:id', isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Review deletion error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// Coupons Management
router.get('/coupons', isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

router.post('/coupons', isAdmin, async (req, res) => {
  try {
    const { code, discountType, discountAmount, minPurchaseAmount, expiryDate, usageLimit } = req.body;
    
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountAmount,
      minPurchaseAmount: minPurchaseAmount || 0,
      expiryDate,
      usageLimit: usageLimit || null
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error('Coupon creation error:', error);
    res.status(500).json({ message: 'Error creating coupon' });
  }
});

router.delete('/coupons/:id', isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Coupon deletion error:', error);
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

module.exports = router;
