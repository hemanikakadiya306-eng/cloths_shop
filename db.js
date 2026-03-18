
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);

    // Retry after 5 sec
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;