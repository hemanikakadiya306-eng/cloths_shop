const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cloths-shop');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@clothshop.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password manually
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user directly without pre-save hook
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@clothshop.com',
      password: hashedPassword, // Use pre-hashed password
      role: 'admin',
      phone: '1234567890'
    });

    // Save without triggering pre-save hook
    await adminUser.save({ validateBeforeSave: true });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@clothshop.com');
    console.log('🔑 Password: admin123');
    console.log('🔗 Login URL: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser();
