
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require('express-session');
const path = require('path');

dotenv.config();

const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contactRoutes");

const http = require("http");
const { Server } = require("socket.io");

const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Socket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Make io available
app.set("io", io);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// CORS
app.use(cors({
  origin: ["http://localhost:5002", "http://localhost:3000"],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contacts", contactRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Clothes Shop API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error"
  });
});

// MongoDB events (important logs)
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.log("🔴 MongoDB Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 MongoDB Disconnected");
});

// ✅ START SERVER AFTER DB CONNECT
const PORT = process.env.PORT || 9999;

const startServer = async () => {
  try {
    await connectDB(); // wait for DB

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`✅ DB Host: ${mongoose.connection.host}`);
    });

  } catch (error) {
    console.error("❌ Server start failed:", error.message);
    process.exit(1);
  }
};

startServer();

// Handle port error
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Stopping server...");

  server.close(() => {
    console.log("HTTP server closed");

    mongoose.connection.close(false).then(() => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("Force shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);